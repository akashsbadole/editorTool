import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { CodeEditor } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { StreamingModal } from "@/components/streaming-modal";
import { AIProviderSelector } from "@/components/ai-provider-selector";
import { EnhancedPromptGenerator } from "@/components/enhanced-prompt-generator";
import { Terminal } from "@/components/terminal";
import { DeploymentPanel } from "@/components/deployment-panel";
import { apiRequest } from "@/lib/queryClient";
import { downloadAsZip, getLanguageFromFileName } from "@/lib/file-utils";
import { 
  Project, 
  InsertPrompt, 
  Prompt, 
  packageTypes, 
  PackageType, 
  AIProvider, 
  CSSFramework,
  aiProviders
} from "@shared/schema";
import { 
  Code, 
  Moon, 
  Sun, 
  Save, 
  Play, 
  Download, 
  Settings, 
  Terminal as TerminalIcon,
  Rocket,
  FolderOpen,
  Plus,
  FileText,
  Search,
  GitBranch,
  Share2,
  ArrowLeft
} from "lucide-react";

export default function IDE() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/ide/:projectId");
  const projectId = params?.projectId;
  
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  
  // AI Provider state
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('ollama');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-coder');
  const [selectedFramework, setSelectedFramework] = useState<CSSFramework>('tailwindcss');
  
  // Initialize model when provider changes
  useEffect(() => {
    const provider = aiProviders.find(p => p.value === selectedProvider);
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0]);
    }
  }, [selectedProvider]);

  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: async (data: InsertPrompt) => {
      const response = await apiRequest('POST', '/api/prompts', data);
      return await response.json() as Prompt;
    },
    onSuccess: (prompt) => {
      setCurrentPromptId(prompt.id);
      setIsGenerating(true);
      setShowStreaming(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project files mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (files: Record<string, string>) => {
      if (!project) throw new Error('No project selected');
      const response = await apiRequest('PATCH', `/api/projects/${project.id}`, { files });
      return await response.json() as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      setUnsavedChanges({});
      toast({
        title: "Files Saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-save unsaved changes every 30 seconds
  useEffect(() => {
    if (Object.keys(unsavedChanges).length === 0) return;
    
    const autoSave = setInterval(() => {
      handleSaveFiles();
    }, 30000);
    
    return () => clearInterval(autoSave);
  }, [unsavedChanges]);

  // Load project files when project is loaded
  useEffect(() => {
    if (project && Object.keys(project.files).length > 0 && !selectedFile) {
      const firstFile = Object.keys(project.files)[0];
      setSelectedFile(firstFile);
      setSelectedFileContent(project.files[firstFile]);
    }
  }, [project, selectedFile]);

  if (!projectId) {
    setLocation('/');
    return null;
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile(path);
    setSelectedFileContent(unsavedChanges[path] || content);
  };

  const handleContentChange = (newContent: string) => {
    setSelectedFileContent(newContent);
    if (selectedFile) {
      setUnsavedChanges(prev => ({
        ...prev,
        [selectedFile]: newContent
      }));
    }
  };

  const handleSaveFiles = () => {
    if (Object.keys(unsavedChanges).length === 0) {
      toast({
        title: "No Changes",
        description: "There are no unsaved changes to save.",
      });
      return;
    }
    
    const updatedFiles = { ...project.files, ...unsavedChanges };
    updateProjectMutation.mutate(updatedFiles);
  };

  const handlePromptSubmit = (promptData: InsertPrompt) => {
    createPromptMutation.mutate(promptData);
  };

  const handleStreamingComplete = (files: Record<string, string>) => {
    const updatedFiles = { ...project.files, ...files };
    updateProjectMutation.mutate(updatedFiles);
    setIsGenerating(false);
    
    toast({
      title: "Code Generated!",
      description: `Successfully generated ${Object.keys(files).length} files.`,
    });
  };

  const handleExportZip = () => {
    const filesToExport = { ...project.files, ...unsavedChanges };
    if (Object.keys(filesToExport).length === 0) {
      toast({
        title: "No files to export",
        description: "Generate or edit some files first.",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadAsZip(filesToExport, `${project.name}-${timestamp}`);
    
    toast({
      title: "Export Started",
      description: "Your project is being downloaded as a ZIP file.",
    });
  };

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;
  const currentFiles = { ...project.files, ...unsavedChanges };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projects
            </Button>
            
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <h1 className="font-semibold text-slate-900 dark:text-white">{project.name}</h1>
              {project.description && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  • {project.description}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {packageTypes.find(t => t.value === project.packageType)?.label}
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveFiles}
              disabled={!hasUnsavedChanges || updateProjectMutation.isPending}
              className="text-slate-600 dark:text-slate-300"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <EnhancedPromptGenerator
              projectId={project.id}
              onSubmit={handlePromptSubmit}
              isLoading={createPromptMutation.isPending}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportZip}
              className="text-slate-600 dark:text-slate-300"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            <AISettingsPanel>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </AISettingsPanel>
          </div>
        </div>
      </header>

      {/* Main IDE Layout */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar - File Tree */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
              <FileTree
                files={currentFiles}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Main Content Area */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col">
              {/* Tab Bar */}
              <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="h-10 p-0 bg-transparent">
                    <TabsTrigger value="editor" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700">
                      <Code className="h-4 w-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700">
                      <TerminalIcon className="h-4 w-4 mr-2" />
                      Terminal
                    </TabsTrigger>
                    <TabsTrigger value="deploy" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700">
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="editor" className="h-full m-0">
                    {selectedFile && selectedFileContent ? (
                      <CodeEditor
                        fileName={selectedFile}
                        content={selectedFileContent}
                        language={getLanguageFromFileName(selectedFile)}
                        theme={theme}
                        readOnly={false}
                        onContentChange={handleContentChange}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-800">
                        <div className="text-center max-w-md">
                          <div className="text-6xl mb-4">📝</div>
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            No File Selected
                          </h2>
                          <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Select a file from the file tree to start editing, or generate new code.
                          </p>
                          <Button
                            onClick={() => setShowStreaming(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="terminal" className="h-full m-0">
                    <Terminal projectId={project.id} files={currentFiles} />
                  </TabsContent>
                  
                  <TabsContent value="deploy" className="h-full m-0 p-6 overflow-y-auto">
                    <DeploymentPanel project={project} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Modals */}
      <StreamingModal
        isOpen={showStreaming}
        onClose={() => setShowStreaming(false)}
        promptId={currentPromptId}
        onComplete={handleStreamingComplete}
      />
    </div>
  );
}