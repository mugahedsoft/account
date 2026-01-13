
import { db } from "./db";
import {
  dailySales, expenses, purchases,
  type DailySales, type InsertDailySales,
  type Expense, type InsertExpense,
  type Purchase, type InsertPurchase
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Daily Sales
  getDailySales(): Promise<DailySales[]>;
  getDailySalesByDate(date: string): Promise<DailySales | undefined>;
  createDailySales(sales: InsertDailySales): Promise<DailySales>;
  updateDailySales(id: number, sales: Partial<InsertDailySales>): Promise<DailySales>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  deletePurchase(id: number): Promise<void>;
  getPurchasesByDateRange(startDate: string, endDate: string): Promise<Purchase[]>;
}

export class DatabaseStorage implements IStorage {
  // Daily Sales
  async getDailySales(): Promise<DailySales[]> {
    return await db.select().from(dailySales).orderBy(desc(dailySales.date));
  }

  async getDailySalesByDate(date: string): Promise<DailySales | undefined> {
    const [sales] = await db.select().from(dailySales).where(eq(dailySales.date, date));
    return sales;
  }

  async createDailySales(sales: InsertDailySales): Promise<DailySales> {
    const [created] = await db.insert(dailySales).values(sales).returning();
    return created;
  }

  async updateDailySales(id: number, sales: Partial<InsertDailySales>): Promise<DailySales> {
    const [updated] = await db.update(dailySales)
      .set(sales)
      .where(eq(dailySales.id, id))
      .returning();
    return updated;
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date), desc(expenses.createdAt));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [created] = await db.insert(expenses).values(expense).returning();
    return created;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return await db.select()
      .from(expenses)
      .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)));
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.date), desc(purchases.createdAt));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [created] = await db.insert(purchases).values(purchase).returning();
    return created;
  }

  async deletePurchase(id: number): Promise<void> {
    await db.delete(purchases).where(eq(purchases.id, id));
  }

  async getPurchasesByDateRange(startDate: string, endDate: string): Promise<Purchase[]> {
    return await db.select()
      .from(purchases)
      .where(and(gte(purchases.date, startDate), lte(purchases.date, endDate)));
  }
}

export const storage = new DatabaseStorage();
