import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type InsertDailySales,
  type InsertExpense,
  type InsertPurchase
} from "@shared/schema";
import {
  localDb,
  type DailySalesRow,
  type ExpenseRow,
  type PurchaseRow,
} from "@/lib/localDb";

type ReportResponse = {
  totalSales: number;
  totalExpenses: number;
  netBankak: number;
  netCash: number;
  totalPurchases: number;
  salesBreakdown: { bankak: number; cash: number };
  expensesBreakdown: { bankak: number; cash: number };
};

const queryKeys = {
  dailySales: ["local", "dailySales"] as const,
  expenses: ["local", "expenses"] as const,
  purchases: ["local", "purchases"] as const,
  reports: (startDate: string, endDate: string) =>
    ["local", "reports", startDate, endDate] as const,
};

// ============================================
// DAILY SALES HOOKS
// ============================================

export function useDailySales() {
  return useQuery({
    queryKey: [...queryKeys.dailySales],
    queryFn: async () => {
      const rows = await localDb.dailySales.orderBy("date").reverse().toArray();
      return rows;
    },
  });
}

export function useCreateDailySales() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDailySales) => {
      const payload = {
        date: String(data.date),
        totalAmount: Number(data.totalAmount),
        bankakAmount: Number(data.bankakAmount),
        cashAmount: Number(data.cashAmount),
        createdAt: new Date().toISOString(),
      };

      const existing = await localDb.dailySales.where("date").equals(payload.date).first();
      if (existing?.id) {
        await localDb.dailySales.update(existing.id, payload);
        return { ...existing, ...payload };
      }

      const id = await localDb.dailySales.add(payload);
      return { id, ...payload };
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...queryKeys.dailySales] }),
  });
}

// ============================================
// EXPENSES HOOKS
// ============================================

export function useExpenses() {
  return useQuery({
    queryKey: [...queryKeys.expenses],
    queryFn: async () => {
      const rows = await localDb.expenses.orderBy("date").reverse().toArray();
      return rows;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertExpense) => {
      const payload = {
        description: String(data.description),
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        date: String(data.date),
        createdAt: new Date().toISOString(),
      };
      const id = await localDb.expenses.add(payload);
      return { id, ...payload };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKeys.expenses] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await localDb.expenses.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKeys.expenses] }),
  });
}

// ============================================
// PURCHASES HOOKS
// ============================================

export function usePurchases() {
  return useQuery({
    queryKey: [...queryKeys.purchases],
    queryFn: async () => {
      const rows = await localDb.purchases.orderBy("date").reverse().toArray();
      return rows;
    },
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPurchase) => {
      const payload = {
        itemName: String(data.itemName),
        amount: Number(data.amount),
        date: String(data.date),
        createdAt: new Date().toISOString(),
      };
      const id = await localDb.purchases.add(payload);
      return { id, ...payload };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKeys.purchases] }),
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await localDb.purchases.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKeys.purchases] }),
  });
}

// ============================================
// REPORTS HOOK
// ============================================

export function useReports(startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.reports(startDate, endDate),
    queryFn: async () => {
      const [sales, expenses, purchases] = await Promise.all([
        localDb.dailySales
          .where("date")
          .between(startDate, endDate, true, true)
          .toArray(),
        localDb.expenses
          .where("date")
          .between(startDate, endDate, true, true)
          .toArray(),
        localDb.purchases
          .where("date")
          .between(startDate, endDate, true, true)
          .toArray(),
      ]) as [DailySalesRow[], ExpenseRow[], PurchaseRow[]];

      const totalSales = sales.reduce(
        (sum: number, s: DailySalesRow) => sum + Number(s.totalAmount),
        0,
      );
      const totalSalesBankak = sales.reduce(
        (sum: number, s: DailySalesRow) => sum + Number(s.bankakAmount),
        0,
      );
      const totalSalesCash = sales.reduce(
        (sum: number, s: DailySalesRow) => sum + Number(s.cashAmount),
        0,
      );

      const totalExpenses = expenses.reduce(
        (sum: number, e: ExpenseRow) => sum + Number(e.amount),
        0,
      );
      const expensesBankak = expenses
        .filter((e: ExpenseRow) => e.paymentMethod === "bankak")
        .reduce((sum: number, e: ExpenseRow) => sum + Number(e.amount), 0);
      const expensesCash = expenses
        .filter((e: ExpenseRow) => e.paymentMethod === "cash")
        .reduce((sum: number, e: ExpenseRow) => sum + Number(e.amount), 0);

      const totalPurchases = purchases.reduce(
        (sum: number, p: PurchaseRow) => sum + Number(p.amount),
        0,
      );

      const netBankak = totalSalesBankak - expensesBankak;
      const netCash = totalSalesCash - expensesCash;

      const report: ReportResponse = {
        totalSales,
        totalExpenses,
        netBankak,
        netCash,
        totalPurchases,
        salesBreakdown: { bankak: totalSalesBankak, cash: totalSalesCash },
        expensesBreakdown: { bankak: expensesBankak, cash: expensesCash },
      };

      return report;
    },
    enabled: !!startDate && !!endDate,
  });
}
