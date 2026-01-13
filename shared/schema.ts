
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const dailySales = sqliteTable("daily_sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(), // One entry per day
  totalAmount: real("total_amount").notNull(),
  bankakAmount: real("bankak_amount").notNull(),
  cashAmount: real("cash_amount").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["bankak", "cash"] }).notNull(),
  date: text("date").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemName: text("item_name").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// === BASE SCHEMAS ===

export const insertDailySalesSchema = createInsertSchema(dailySales)
  .omit({ id: true, createdAt: true })
  .extend({
    totalAmount: z.coerce.number(),
    bankakAmount: z.coerce.number(),
    cashAmount: z.coerce.number(),
  });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.coerce.number(),
  });

export const insertPurchaseSchema = createInsertSchema(purchases)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.coerce.number(),
  });

// === EXPLICIT API CONTRACT TYPES ===

export type DailySales = typeof dailySales.$inferSelect;
export type InsertDailySales = z.infer<typeof insertDailySalesSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

// Request types
export type CreateDailySalesRequest = InsertDailySales;
export type UpdateDailySalesRequest = Partial<InsertDailySales>;

export type CreateExpenseRequest = InsertExpense;
export type UpdateExpenseRequest = Partial<InsertExpense>;

export type CreatePurchaseRequest = InsertPurchase;
export type UpdatePurchaseRequest = Partial<InsertPurchase>;

// Response types
export type ReportResponse = {
  period: string;
  totalSales: number;
  totalExpenses: number;
  netBankak: number;
  netCash: number;
  totalPurchases: number;
  salesBreakdown: { bankak: number; cash: number };
  expensesBreakdown: { bankak: number; cash: number };
};
