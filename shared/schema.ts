import { pgTable, text, integer, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'solve', 'summarize', 'mcq'
  subject: text("subject"),
  content: text("content").notNull(),
  result: text("result").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHistorySchema = createInsertSchema(history).omit({ 
  id: true, 
  createdAt: true 
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique(),
  isPremium: boolean("is_premium").default(false).notNull(),
  subscriptionStatus: text("subscription_status").default("free").notNull(), // free, premium, cancelled
  requestCount: integer("request_count").default(0).notNull(),
  expiryDate: timestamp("expiry_date"),
  paymentTransactionIds: text("payment_transaction_ids"), // comma separated or JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Request types
export const generateRequestSchema = z.object({
  type: z.enum(['solve', 'summarize', 'mcq']),
  subject: z.string().optional(),
  content: z.string().optional(),
  fileData: z.string().optional(), // base64 for images/docs
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  count: z.number().optional(), // Number of MCQs to generate
  complexity: z.enum(['easy', 'medium', 'difficult']).optional(), // Complexity level for summaries
  language: z.enum(['english', 'urdu', 'both']).optional(), // Language preference
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export type GenerateResponse = {
  result: string;
  remaining: number;
};
