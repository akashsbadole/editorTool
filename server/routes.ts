import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiProviderService } from "./ai-providers";
import { 
  insertPromptSchema, 
  updatePromptSchema,
  insertProjectSchema,
  updateProjectSchema,
  insertDeploymentSchema,
  updateDeploymentSchema,
  updateSettingsSchema
} from "@shared/schema";
import { z } from "zod";

// AI API integration with multiple providers
async function* streamAIResponse(aiProvider: string, model: string, packageType: string, command: string, cssFramework?: string) {
  try {
    const aiConfig = {
      provider: aiProvider as any,
      model: model,
      packageType: packageType as any,
      command: command,
      cssFramework: cssFramework as any,
    };

    let fullResponse = '';

    // Handle special package types
    if (packageType === 'html') {
      const stream = await aiProviderService.generateHTML(command, cssFramework as any);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        yield {
          type: 'progress',
          content: chunk,
          done: false
        };
      }
    } else if (packageType === 'css') {
      const stream = await aiProviderService.generateCSS(command, cssFramework as any || 'tailwindcss');
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        yield {
          type: 'progress',
          content: chunk,
          done: false
        };
      }
    } else {
      // Use the general AI provider service
      const stream = await aiProviderService.generateCode(aiConfig);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        yield {
          type: 'progress',
          content: chunk,
          done: false
        };
      }
    }

    // Parse the complete response and extract files
    const files = parseGeneratedFiles(fullResponse);
    
    yield {
      type: 'complete',
      files: files,
      done: true
    };

  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      done: true
    };
  }
}

// Parse generated files from AI response
function parseGeneratedFiles(response: string): Record<string, string> {
  const files: Record<string, string> = {};
  
  try {
    // Try to extract files from <FILES> format
    const filesMatch = response.match(/<FILES>([\s\S]*)<\/FILES>/);
    if (filesMatch) {
      const filesContent = filesMatch[1];
      const fileRegex = /<FILE path="([^"]+)">([\s\S]*?)<\/FILE>/g;
      let match;
      
      while ((match = fileRegex.exec(filesContent)) !== null) {
        const [, path, content] = match;
        files[path] = content.trim();
      }
      
      if (Object.keys(files).length > 0) {
        return files;
      }
    }
    
    // Try to extract JSON format
    const jsonMatch = response.match(/\{[\s\S]*"files"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        if (result.files && typeof result.files === 'object') {
          return result.files;
        }
      } catch (e) {
        // JSON parsing failed, continue to fallback
      }
    }
    
    // Fallback: create a single file with the entire response
    const extension = response.includes('<!DOCTYPE html') ? 'html' : 
                     response.includes('import ') || response.includes('export ') ? 'tsx' :
                     response.includes('.selector') || response.includes('{') ? 'css' : 'txt';
    
    files[`generated-code.${extension}`] = response.trim();
    
  } catch (error) {
    console.error('Error parsing generated files:', error);
    files['generated-code.txt'] = response.trim();
  }
  
  return files;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects endpoints
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = updateProjectSchema.parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Deployments endpoints
  app.get("/api/deployments/:projectId", async (req, res) => {
    try {
      const deployments = await storage.getDeployments(req.params.projectId);
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployments" });
    }
  });

  app.post("/api/deployments", async (req, res) => {
    try {
      const validatedData = insertDeploymentSchema.parse(req.body);
      const deployment = await storage.createDeployment(validatedData);
      
      // Simulate deployment process
      setTimeout(async () => {
        try {
          await storage.updateDeployment(deployment.id, {
            status: "building",
            logs: "Building application...\nInstalling dependencies...\nRunning build scripts..."
          });
          
          // Simulate build completion
          setTimeout(async () => {
            const mockUrl = `https://${validatedData.platform}-${deployment.id.slice(0, 8)}.app`;
            await storage.updateDeployment(deployment.id, {
              status: "deployed",
              url: mockUrl,
              logs: "Build completed successfully!\nApplication deployed to: " + mockUrl
            });
            
            // Update project with deployment URL
            await storage.updateProject(validatedData.projectId, {
              deploymentUrl: mockUrl,
              status: "deployed"
            });
          }, 3000);
        } catch (error) {
          await storage.updateDeployment(deployment.id, {
            status: "error",
            logs: "Deployment failed: " + (error instanceof Error ? error.message : "Unknown error")
          });
        }
      }, 1000);
      
      res.json(deployment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create deployment" });
    }
  });

  // Get all prompts
  app.get("/api/prompts", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const prompts = await storage.getPrompts(projectId);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  // Get specific prompt
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const prompt = await storage.getPrompt(req.params.id);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompt" });
    }
  });

  // Create new prompt and start generation
  app.post("/api/prompts", async (req, res) => {
    try {
      const validatedData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(validatedData);
      res.json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  // Stream code generation
  app.get("/api/prompts/:id/generate", async (req, res) => {
    try {
      const prompt = await storage.getPrompt(req.params.id);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      // Set headers for Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // Update prompt status to generating
      await storage.updatePrompt(prompt.id, { status: "generating" });

      try {
        for await (const chunk of streamAIResponse(
          prompt.aiProvider, 
          prompt.model, 
          prompt.packageType, 
          prompt.command
        )) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);

          if (chunk.type === 'complete' && chunk.files) {
            // Update prompt with generated files
            await storage.updatePrompt(prompt.id, {
              generatedFiles: chunk.files,
              status: "completed"
            });
          } else if (chunk.type === 'error') {
            await storage.updatePrompt(prompt.id, { status: "error" });
          }

          if (chunk.done) {
            break;
          }
        }
      } catch (error) {
        await storage.updatePrompt(prompt.id, { status: "error" });
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Generation failed',
          done: true
        })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.status(500).json({ error: "Failed to start generation" });
    }
  });

  // Delete prompt
  app.delete("/api/prompts/:id", async (req, res) => {
    try {
      const success = await storage.deletePrompt(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const validatedData = updateSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
