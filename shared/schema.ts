import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  packageType: text("package_type").notNull(),
  files: jsonb("files").$type<Record<string, string>>().notNull().default({}),
  dependencies: jsonb("dependencies").$type<Record<string, string>>().notNull().default({}),
  envVars: jsonb("env_vars").$type<Record<string, string>>().notNull().default({}),
  isPublic: boolean("is_public").notNull().default(false),
  deploymentUrl: text("deployment_url"),
  status: text("status").notNull().default("draft"), // draft, deploying, deployed, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id"),
  packageType: text("package_type").notNull(),
  command: text("command").notNull(),
  generatedFiles: jsonb("generated_files").$type<Record<string, string>>().notNull().default({}),
  status: text("status").notNull().default("pending"), // pending, generating, completed, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deployments = pgTable("deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  platform: text("platform").notNull(), // vercel, netlify, railway
  url: text("url"),
  status: text("status").notNull().default("pending"), // pending, building, deployed, error
  logs: text("logs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project schemas
export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  packageType: true,
  isPublic: true,
});

export const updateProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  files: true,
  dependencies: true,
  envVars: true,
  isPublic: true,
  deploymentUrl: true,
  status: true,
}).partial();

// Prompt schemas
export const insertPromptSchema = createInsertSchema(prompts).pick({
  projectId: true,
  packageType: true,
  command: true,
});

export const updatePromptSchema = createInsertSchema(prompts).pick({
  generatedFiles: true,
  status: true,
}).partial();

// Deployment schemas
export const insertDeploymentSchema = createInsertSchema(deployments).pick({
  projectId: true,
  platform: true,
});

export const updateDeploymentSchema = createInsertSchema(deployments).pick({
  url: true,
  status: true,
  logs: true,
}).partial();

// Types
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type UpdatePrompt = z.infer<typeof updatePromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type UpdateDeployment = z.infer<typeof updateDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

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
