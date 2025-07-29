import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { CodeEditor } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { StreamingModal } from "@/components/streaming-modal";
import { HistoryModal } from "@/components/history-modal";
import { apiRequest } from "@/lib/queryClient";
import { downloadAsZip, getLanguageFromFileName } from "@/lib/file-utils";
import { InsertPrompt, Prompt, packageTypes, PackageType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Code, 
  Moon, 
  Sun, 
  History, 
  Settings, 
  Wand2, 
  Download, 
  Pause, 
  Loader2,
  FileText,
  Clock,
  Package
} from "lucide-react";

export default function Home() {
  const [packageType, setPackageType] = useState<PackageType>('frontend');
  const [command, setCommand] = useState('');
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent prompts for sidebar
  const { data: recentPrompts = [] } = useQuery<Prompt[]>({
    queryKey: ['/api/prompts'],
    refetchInterval: 30000, // Refresh every 30 seconds
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
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateCode = () => {
    if (!command.trim()) {
      toast({
        title: "Error",
        description: "Please enter a command to generate code.",
        variant: "destructive",
      });
      return;
    }

    createPromptMutation.mutate({
      packageType,
      command: command.trim(),
    });
  };

  const handleStreamingComplete = (files: Record<string, string>) => {
    setGeneratedFiles(files);
    setIsGenerating(false);
    
    // Auto-select first file
    const firstFile = Object.keys(files)[0];
    if (firstFile) {
      setSelectedFile(firstFile);
      setSelectedFileContent(files[firstFile]);
    }

    toast({
      title: "Code Generated!",
      description: `Successfully generated ${Object.keys(files).length} files.`,
    });
  };

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile(path);
    setSelectedFileContent(content);
  };

  const handleExportZip = () => {
    if (Object.keys(generatedFiles).length === 0) {
      toast({
        title: "No files to export",
        description: "Generate some code first to export as ZIP.",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadAsZip(generatedFiles, `codecraft-${packageType}-${timestamp}`);
    
    toast({
      title: "Export Started",
      description: "Your code is being downloaded as a ZIP file.",
    });
  };

  const handleReusePrompt = (prompt: Prompt) => {
    setPackageType(prompt.packageType as PackageType);
    setCommand(prompt.command);
    
    if (prompt.status === 'completed' && Object.keys(prompt.generatedFiles).length > 0) {
      setGeneratedFiles(prompt.generatedFiles);
      const firstFile = Object.keys(prompt.generatedFiles)[0];
      if (firstFile) {
        setSelectedFile(firstFile);
        setSelectedFileContent(prompt.generatedFiles[firstFile]);
      }
    }

    toast({
      title: "Prompt Loaded",
      description: "Previous prompt has been loaded. You can modify and regenerate.",
    });
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    setShowStreaming(false);
    setCurrentPromptId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">CodeCraft AI</h1>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Intelligent Code Generation</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </Button>
            
            {/* History Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
            
            {/* Settings */}
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Package Selection */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Package Type</h3>
            <Select value={packageType} onValueChange={(value: PackageType) => setPackageType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {packageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Command Input */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Describe Your Code</h3>
            <div className="space-y-3">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g., Create a login form with email validation and password visibility toggle using React and Tailwind CSS"
                className="min-h-[100px] resize-none"
              />
              
              <Button
                onClick={handleGenerateCode}
                disabled={isGenerating || !command.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Recent Prompts */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Recent Prompts</h3>
            <div className="space-y-2">
              {recentPrompts.slice(0, 10).map((prompt) => (
                <Card
                  key={prompt.id}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => handleReusePrompt(prompt)}
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                      {prompt.command}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-2">
                        <Package className="h-3 w-3" />
                        <span>{packageTypes.find(t => t.value === prompt.packageType)?.label}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Badge className={
                      prompt.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : prompt.status === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }>
                      {prompt.status}
                    </Badge>
                  </div>
                </Card>
              ))}
              
              {recentPrompts.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No prompts yet</p>
                  <p className="text-xs">Generate your first code!</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Status Bar */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Generating code...</span>
                  </div>
                ) : Object.keys(generatedFiles).length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Generated {Object.keys(generatedFiles).length} files
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Ready to generate code</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {isGenerating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStopGeneration}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                
                <Button
                  onClick={handleExportZip}
                  disabled={Object.keys(generatedFiles).length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ZIP
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* File Tree */}
            <div className="w-64 bg-slate-100 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600 overflow-y-auto">
              <FileTree
                files={generatedFiles}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
              />
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              {selectedFile && selectedFileContent ? (
                <CodeEditor
                  fileName={selectedFile}
                  content={selectedFileContent}
                  language={getLanguageFromFileName(selectedFile)}
                  theme={theme}
                  readOnly={true}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">🚀</div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Welcome to CodeCraft AI
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      Describe what you want to build and let AI generate production-ready code for you.
                    </p>
                    <div className="space-y-2 text-sm text-slate-400 dark:text-slate-500">
                      <p>1. Select a package type</p>
                      <p>2. Describe your requirements</p>
                      <p>3. Watch AI generate your code</p>
                      <p>4. Export and use in your projects</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <StreamingModal
        isOpen={showStreaming}
        onClose={() => setShowStreaming(false)}
        promptId={currentPromptId}
        onComplete={handleStreamingComplete}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onReusePrompt={handleReusePrompt}
      />
    </div>
  );
}
