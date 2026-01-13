
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const dbFile = process.env.SQLITE_DB_PATH || "app.db";

export const sqlite = new Database(dbFile);
export const db = drizzle(sqlite, { schema });
