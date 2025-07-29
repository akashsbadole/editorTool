import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { ProjectManager } from "@/components/project-manager";
import { Project } from "@shared/schema";
import { 
  Code, 
  Moon, 
  Sun, 
  Settings, 
  Wand2, 
  Play,
  Rocket,
  Users,
  Zap
} from "lucide-react";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setLocation(`/ide/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CodeCraft AI</h1>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Advanced Code Generation Platform</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </button>
            
            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Build Applications with AI
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Generate production-ready code, deploy instantly, and collaborate in real-time with our advanced IDE platform.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <div className="text-blue-600 text-2xl mb-3">
                <Wand2 className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                AI Code Generation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Powered by DeepSeek Coder and Code Llama models for intelligent code generation
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <div className="text-green-600 text-2xl mb-3">
                <Play className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                IDE Experience
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Full-featured IDE with Monaco editor, terminal, and advanced debugging tools
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <div className="text-purple-600 text-2xl mb-3">
                <Rocket className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                One-Click Deploy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Deploy to Vercel, Netlify, or Railway with automatic scaling and monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <ProjectManager 
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
        />
      </div>
    </div>
  );
}
