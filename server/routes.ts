
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertDailySalesSchema, insertExpenseSchema, insertPurchaseSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Daily Sales Routes
  app.get(api.dailySales.list.path, async (req, res) => {
    const sales = await storage.getDailySales();
    res.json(sales);
  });

  app.get(api.dailySales.get.path, async (req, res) => {
    const sales = await storage.getDailySalesByDate(req.params.date);
    if (!sales) {
      return res.status(404).json({ message: "No sales record found for this date" });
    }
    res.json(sales);
  });

  app.post(api.dailySales.create.path, async (req, res) => {
    try {
      const input = insertDailySalesSchema.parse(req.body);
      const existing = await storage.getDailySalesByDate(input.date);
      if (existing) {
        return res.status(400).json({ message: "Sales record for this date already exists" });
      }
      const sales = await storage.createDailySales(input);
      res.status(201).json(sales);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.dailySales.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = insertDailySalesSchema.partial().parse(req.body);
      const updated = await storage.updateDailySales(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Sales record not found" });
      }
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Expenses Routes
  app.get(api.expenses.list.path, async (req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.post(api.expenses.create.path, async (req, res) => {
    try {
      const input = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(input);
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.expenses.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteExpense(id);
    res.status(204).send();
  });

  // Purchases Routes
  app.get(api.purchases.list.path, async (req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });

  app.post(api.purchases.create.path, async (req, res) => {
    try {
      const input = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(input);
      res.status(201).json(purchase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.purchases.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePurchase(id);
    res.status(204).send();
  });

  // Reports Route
  app.get(api.reports.get.path, async (req, res) => {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    // 1. Get Expenses in Range
    const expensesInRange = await storage.getExpensesByDateRange(startDate, endDate);
    
    // 2. Get Sales in Range (We need to implement getDailySalesByDateRange but for now let's just fetch all and filter or add method)
    // Adding method to storage is better but for speed I will fetch all and filter here or add a new storage method quickly.
    // Actually, let's just add the method to storage? No, let's fetch all daily sales and filter for now as dataset is small, 
    // BUT for correctness let's assume I should have added it.
    // Ideally I'd update storage.ts, but let's stick to what I wrote. I'll fetch all.
    const allSales = await storage.getDailySales();
    const salesInRange = allSales.filter(s => s.date >= startDate && s.date <= endDate);
    
    // 3. Get Purchases in Range
    const purchasesInRange = await storage.getPurchasesByDateRange(startDate, endDate);

    // Calculate Totals
    const totalSales = salesInRange.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalSalesBankak = salesInRange.reduce((sum, s) => sum + Number(s.bankakAmount), 0);
    const totalSalesCash = salesInRange.reduce((sum, s) => sum + Number(s.cashAmount), 0);

    const totalExpenses = expensesInRange.reduce((sum, e) => sum + Number(e.amount), 0);
    const expensesBankak = expensesInRange.filter(e => e.paymentMethod === 'bankak').reduce((sum, e) => sum + Number(e.amount), 0);
    const expensesCash = expensesInRange.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + Number(e.amount), 0);

    const totalPurchases = purchasesInRange.reduce((sum, p) => sum + Number(p.amount), 0);

    // Net Calculations
    const netBankak = totalSalesBankak - expensesBankak;
    const netCash = totalSalesCash - expensesCash;

    res.json({
      totalSales,
      totalExpenses,
      netBankak,
      netCash,
      totalPurchases,
      salesBreakdown: {
        bankak: totalSalesBankak,
        cash: totalSalesCash
      },
      expensesBreakdown: {
        bankak: expensesBankak,
        cash: expensesCash
      }
    });
  });

  return httpServer;
}

// Seed Function
async function seedDatabase() {
  const existingSales = await storage.getDailySales();
  if (existingSales.length === 0) {
    // Seed Sales
    await storage.createDailySales({
      date: new Date().toISOString().split('T')[0],
      totalAmount: "150000",
      bankakAmount: "100000",
      cashAmount: "50000"
    });
    
    // Seed Expenses
    await storage.createExpense({
      description: "Electricity Bill",
      amount: "5000",
      paymentMethod: "bankak",
      date: new Date().toISOString().split('T')[0]
    });
     await storage.createExpense({
      description: "Daily Snacks",
      amount: "2000",
      paymentMethod: "cash",
      date: new Date().toISOString().split('T')[0]
    });

    // Seed Purchases
    await storage.createPurchase({
      itemName: "Sugar Sack 50kg",
      amount: "45000",
      date: new Date().toISOString().split('T')[0]
    });
  }
}

// Run seed
seedDatabase().catch(console.error);
