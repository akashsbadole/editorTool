import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPromptSchema, 
  updatePromptSchema,
  insertProjectSchema,
  updateProjectSchema,
  insertDeploymentSchema,
  updateDeploymentSchema
} from "@shared/schema";
import { z } from "zod";

// Ollama API integration
async function* streamOllamaResponse(packageType: string, command: string) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "deepseek-coder";
  
  const prompt = `You are an expert code generator. Generate production-ready code based on the following request:

Package Type: ${packageType}
Request: ${command}

Generate complete, functional code with proper file structure. Include all necessary files, imports, and configurations. Respond with a JSON object containing:
{
  "files": {
    "filename.ext": "file content here",
    "folder/file.ext": "nested file content"
  },
  "description": "Brief description of what was generated"
}

Ensure the code is production-ready, follows best practices, and includes proper error handling.`;

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: {
          temperature: 0.1, // Lower temperature for more consistent code generation
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';
    let generatedFiles: Record<string, string> = {};
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            
            if (data.response) {
              yield {
                type: 'progress',
                content: data.response,
                done: data.done || false
              };

              // Try to parse generated files if response looks like JSON
              if (data.done && data.response.includes('"files"')) {
                try {
                  const jsonMatch = data.response.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    if (result.files) {
                      generatedFiles = result.files;
                    }
                  }
                } catch (e) {
                  // If not valid JSON, treat as plain text
                  generatedFiles = {
                    'generated-code.txt': data.response
                  };
                }
              }
            }

            if (data.done) {
              yield {
                type: 'complete',
                files: generatedFiles,
                done: true
              };
              break;
            }
          } catch (e) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }
  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      done: true
    };
  }
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
        for await (const chunk of streamOllamaResponse(prompt.packageType, prompt.command)) {
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

  const httpServer = createServer(app);
  return httpServer;
}
