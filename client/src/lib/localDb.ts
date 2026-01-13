import Dexie, { type Table } from "dexie";

export type DailySalesRow = {
 id?: number;
 date: string;
 totalAmount: number;
 bankakAmount: number;
 cashAmount: number;
 createdAt?: string;
};

export type ExpenseRow = {
 id?: number;
 description: string;
 amount: number;
 paymentMethod: "bankak" | "cash";
 date: string;
 createdAt?: string;
};

export type PurchaseRow = {
 id?: number;
 itemName: string;
 amount: number;
 date: string;
 createdAt?: string;
};

class LocalDb extends Dexie {
 dailySales!: Table<DailySalesRow, number>;
 expenses!: Table<ExpenseRow, number>;
 purchases!: Table<PurchaseRow, number>;

 constructor() {
  super("local_finance_db");

  this.version(1).stores({
   dailySales: "++id,&date,date,createdAt",
   expenses: "++id,date,paymentMethod,createdAt",
   purchases: "++id,date,createdAt",
  });
 }
}

export const localDb = new LocalDb();
