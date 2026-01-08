import { history, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createHistory(item: any): Promise<any>;
  getHistory(): Promise<any[]>;
  deleteHistory(id: number): Promise<void>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  checkRateLimit(ip: string): boolean;
  getRemainingRequests(ip: string): number;
}

export class DatabaseStorage implements IStorage {
  private usage: Map<string, { count: number; date: string }> = new Map();
  private readonly DAILY_LIMIT = 5;

  async createHistory(item: any): Promise<any> {
    const ip = (item as any).ip || 'unknown';
    this.checkRateLimit(ip);
    const [entry] = await db.insert(history).values(item).returning();
    return entry;
  }

  async getHistory(): Promise<any[]> {
    try {
      return await db.select().from(history).orderBy(desc(history.createdAt));
    } catch (error) {
      console.error("Database fetch error:", error);
      return [];
    }
  }

  async deleteHistory(id: number): Promise<void> {
    await db.delete(history).where(eq(history.id, id));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  checkRateLimit(ip: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const record = this.usage.get(ip);
    if (!record || record.date !== today) {
      this.usage.set(ip, { count: 1, date: today });
      return true;
    }
    if (record.count >= this.DAILY_LIMIT) return false;
    record.count++;
    return true;
  }

  getRemainingRequests(ip: string): number {
    const today = new Date().toISOString().split('T')[0];
    const record = this.usage.get(ip);
    if (!record || record.date !== today) return this.DAILY_LIMIT;
    return Math.max(0, this.DAILY_LIMIT - record.count);
  }
}

export const storage = new DatabaseStorage();
