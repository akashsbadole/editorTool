import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageType: text("package_type").notNull(),
  command: text("command").notNull(),
  generatedFiles: jsonb("generated_files").$type<Record<string, string>>().notNull().default({}),
  status: text("status").notNull().default("pending"), // pending, generating, completed, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  packageType: true,
  command: true,
});

export const updatePromptSchema = createInsertSchema(prompts).pick({
  generatedFiles: true,
  status: true,
}).partial();

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type UpdatePrompt = z.infer<typeof updatePromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// File tree structure for frontend
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  language?: string;
}

// Package types
export const packageTypes = [
  { value: 'frontend', label: 'Frontend (React/Vue/Angular)' },
  { value: 'backend', label: 'Backend (Node.js/Python/Go)' },
  { value: 'fullstack', label: 'Full Stack Application' },
  { value: 'mobile', label: 'Mobile (React Native/Flutter)' },
  { value: 'component', label: 'UI Components' },
  { value: 'utility', label: 'Utility Functions' },
] as const;

export type PackageType = typeof packageTypes[number]['value'];
