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
  aiProvider: text("ai_provider").notNull().default("ollama"), // ollama, openai, claude, mistral
  model: text("model").notNull().default("deepseek-coder:6.7b"),
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
  aiProvider: true,
  model: true,
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

// AI Providers
export const aiProviders = [
  { 
    value: 'ollama', 
    label: 'Ollama (Local)', 
    models: [
      'deepseek-coder:6.7b',
      'codellama:7b',
      'codellama:13b',
      'codellama:34b',
      'starcoder:7b',
      'wizardcoder:7b'
    ]
  },
  { 
    value: 'openai', 
    label: 'OpenAI', 
    models: [
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-4'
    ]
  },
  { 
    value: 'claude', 
    label: 'Anthropic Claude', 
    models: [
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-haiku-20240307'
    ]
  },
  { 
    value: 'mistral', 
    label: 'Mistral AI', 
    models: [
      'mistral-large-latest',
      'mistral-medium-latest',
      'codestral-latest',
      'mistral-7b-instruct'
    ]
  }
] as const;

export type AIProvider = typeof aiProviders[number]['value'];

// CSS Frameworks
export const cssFrameworks = [
  { value: 'tailwindcss', label: 'Tailwind CSS' },
  { value: 'bootstrap', label: 'Bootstrap' },
  { value: 'bulma', label: 'Bulma' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'materialize', label: 'Materialize' },
  { value: 'semantic', label: 'Semantic UI' },
  { value: 'chakra', label: 'Chakra UI' },
  { value: 'mui', label: 'Material-UI' },
  { value: 'antd', label: 'Ant Design' },
  { value: 'vanilla', label: 'Vanilla CSS' }
] as const;

export type CSSFramework = typeof cssFrameworks[number]['value'];

// Package types
export const packageTypes = [
  { value: 'frontend', label: 'Frontend (React/Vue/Angular)' },
  { value: 'backend', label: 'Backend (Node.js/Python/Go)' },
  { value: 'fullstack', label: 'Full Stack Application' },
  { value: 'mobile', label: 'Mobile (React Native/Flutter)' },
  { value: 'component', label: 'UI Components' },
  { value: 'utility', label: 'Utility Functions' },
  { value: 'html', label: 'HTML Templates' },
  { value: 'css', label: 'CSS Framework Components' },
  { value: 'landing', label: 'Landing Pages' },
  { value: 'dashboard', label: 'Dashboard Templates' },
  { value: 'figma', label: 'Figma to Code' },
] as const;

export type PackageType = typeof packageTypes[number]['value'];

// Settings schema
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // For multi-user support in future
  
  // AI Provider Settings
  defaultAiProvider: text("default_ai_provider").notNull().default("ollama"),
  
  // Ollama Settings
  ollamaUrl: text("ollama_url").default("http://localhost:11434"),
  ollamaDefaultModel: text("ollama_default_model").default("deepseek-coder:6.7b"),
  
  // OpenAI Settings
  openaiApiKey: text("openai_api_key"),
  openaiDefaultModel: text("openai_default_model").default("gpt-4o"),
  openaiOrganization: text("openai_organization"),
  
  // Anthropic Settings
  anthropicApiKey: text("anthropic_api_key"),
  anthropicDefaultModel: text("anthropic_default_model").default("claude-sonnet-4-20250514"),
  
  // Mistral Settings
  mistralApiKey: text("mistral_api_key"),
  mistralDefaultModel: text("mistral_default_model").default("mistral-large-latest"),
  
  // General Settings
  defaultCssFramework: text("default_css_framework").default("tailwindcss"),
  enableFigmaIntegration: boolean("enable_figma_integration").default(false),
  figmaAccessToken: text("figma_access_token"),
  
  // Code Generation Settings
  codeStyle: text("code_style").default("prettier"), // prettier, eslint, custom
  typescript: boolean("typescript").default(true),
  includeComments: boolean("include_comments").default(true),
  generateTests: boolean("generate_tests").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSettingsSchema = insertSettingsSchema.partial();

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
