import { 
  type Prompt, 
  type InsertPrompt, 
  type UpdatePrompt,
  type Project,
  type InsertProject,
  type UpdateProject,
  type Deployment,
  type InsertDeployment,
  type UpdateDeployment,
  type Settings,
  type InsertSettings,
  type UpdateSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Prompts
  getPrompt(id: string): Promise<Prompt | undefined>;
  getPrompts(projectId?: string): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: string, updates: UpdatePrompt): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<boolean>;
  
  // Deployments
  getDeployment(id: string): Promise<Deployment | undefined>;
  getDeployments(projectId: string): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: string, updates: UpdateDeployment): Promise<Deployment | undefined>;
  deleteDeployment(id: string): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private prompts: Map<string, Prompt>;
  private deployments: Map<string, Deployment>;
  private settings: Settings;

  constructor() {
    this.projects = new Map();
    this.prompts = new Map();
    this.deployments = new Map();
    
    // Initialize default settings
    this.settings = {
      id: randomUUID(),
      userId: null,
      defaultAiProvider: "ollama",
      ollamaUrl: "http://localhost:11434",
      ollamaDefaultModel: "deepseek-coder:6.7b",
      openaiApiKey: null,
      openaiDefaultModel: "gpt-4o",
      openaiOrganization: null,
      anthropicApiKey: null,
      anthropicDefaultModel: "claude-sonnet-4-20250514",
      mistralApiKey: null,
      mistralDefaultModel: "mistral-large-latest",
      defaultCssFramework: "tailwindcss",
      enableFigmaIntegration: false,
      figmaAccessToken: null,
      codeStyle: "prettier",
      typescript: true,
      includeComments: true,
      generateTests: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      description: insertProject.description || null,
      files: {},
      dependencies: {},
      envVars: {},
      deploymentUrl: null,
      status: "draft",
      isPublic: insertProject.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: UpdateProject): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Also delete related prompts and deployments
    const prompts = Array.from(this.prompts.values()).filter(p => p.projectId === id);
    const deployments = Array.from(this.deployments.values()).filter(d => d.projectId === id);
    
    prompts.forEach(p => this.prompts.delete(p.id));
    deployments.forEach(d => this.deployments.delete(d.id));
    
    return this.projects.delete(id);
  }

  // Prompts
  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getPrompts(projectId?: string): Promise<Prompt[]> {
    const allPrompts = Array.from(this.prompts.values());
    const filteredPrompts = projectId 
      ? allPrompts.filter(p => p.projectId === projectId)
      : allPrompts;
    
    return filteredPrompts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      projectId: insertPrompt.projectId || null,
      generatedFiles: {},
      status: "pending",
      aiProvider: insertPrompt.aiProvider || "ollama",
      model: insertPrompt.model || "deepseek-coder",
      createdAt: new Date(),
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async updatePrompt(id: string, updates: UpdatePrompt): Promise<Prompt | undefined> {
    const existing = this.prompts.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.prompts.set(id, updated);
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    return this.prompts.delete(id);
  }

  // Deployments
  async getDeployment(id: string): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async getDeployments(projectId: string): Promise<Deployment[]> {
    return Array.from(this.deployments.values())
      .filter(d => d.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const id = randomUUID();
    const deployment: Deployment = {
      ...insertDeployment,
      id,
      url: null,
      status: "pending",
      logs: null,
      createdAt: new Date(),
    };
    this.deployments.set(id, deployment);
    return deployment;
  }

  async updateDeployment(id: string, updates: UpdateDeployment): Promise<Deployment | undefined> {
    const existing = this.deployments.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.deployments.set(id, updated);
    return updated;
  }

  async deleteDeployment(id: string): Promise<boolean> {
    return this.deployments.delete(id);
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings> {
    this.settings = { ...this.settings, ...updates, updatedAt: new Date() };
    return this.settings;
  }
}

export const storage = new MemStorage();
