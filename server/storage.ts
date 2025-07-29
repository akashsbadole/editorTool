import { type Prompt, type InsertPrompt, type UpdatePrompt } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPrompt(id: string): Promise<Prompt | undefined>;
  getPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: string, updates: UpdatePrompt): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private prompts: Map<string, Prompt>;

  constructor() {
    this.prompts = new Map();
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      generatedFiles: {},
      status: "pending",
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
}

export const storage = new MemStorage();
