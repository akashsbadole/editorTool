import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AIProviderSelector } from "./ai-provider-selector";
import { 
  packageTypes, 
  PackageType, 
  AIProvider, 
  CSSFramework,
  InsertPrompt 
} from "@shared/schema";
import { 
  Plus, 
  Sparkles, 
  Code, 
  Layout, 
  Palette, 
  Zap,
  Globe,
  Component,
  Database,
  Server
} from "lucide-react";

interface EnhancedPromptGeneratorProps {
  projectId?: string;
  onSubmit: (prompt: InsertPrompt) => void;
  isLoading?: boolean;
}

const packageTypeIcons: Record<PackageType, any> = {
  frontend: Layout,
  backend: Server,
  fullstack: Globe,
  component: Component,
  mobile: Component,
  html: Layout,
  css: Palette,
  landing: Layout,
  dashboard: Layout,
  utility: Code,
  figma: Layout
};

const quickTemplates = [
  {
    id: 'react-dashboard',
    name: 'React Dashboard',
    packageType: 'dashboard' as PackageType,
    description: 'Modern admin dashboard with charts, tables, and responsive design',
    prompt: 'Create a modern React admin dashboard with sidebar navigation, data tables, charts using recharts, user management, and responsive design. Include dark mode support and proper TypeScript types.'
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    packageType: 'landing' as PackageType,
    description: 'Professional landing page with hero section, features, and CTA',
    prompt: 'Build a professional landing page with hero section, features grid, testimonials, pricing table, and contact form. Use modern animations and responsive design.'
  },
  {
    id: 'rest-api',
    name: 'REST API',
    packageType: 'backend' as PackageType,
    description: 'Express.js REST API with authentication and database integration',
    prompt: 'Create a complete REST API using Express.js with user authentication, CRUD operations, middleware for validation, error handling, and database integration. Include API documentation.'
  },
  {
    id: 'ui-components',
    name: 'UI Component Library',
    packageType: 'component' as PackageType,
    description: 'Reusable React components with Storybook documentation',
    prompt: 'Build a comprehensive UI component library with buttons, forms, modals, cards, and navigation components. Include TypeScript props, variants, and Storybook stories.'
  }
];

export function EnhancedPromptGenerator({ 
  projectId, 
  onSubmit, 
  isLoading = false 
}: EnhancedPromptGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [packageType, setPackageType] = useState<PackageType>('frontend');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // AI Provider state
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('ollama');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-coder');
  const [selectedFramework, setSelectedFramework] = useState<CSSFramework>('tailwindcss');

  const handleTemplateSelect = (template: typeof quickTemplates[0]) => {
    setSelectedTemplate(template.id);
    setPackageType(template.packageType);
    setCommand(template.prompt);
  };

  const handleSubmit = () => {
    if (!command.trim()) return;

    const promptData: InsertPrompt = {
      projectId: projectId || null,
      packageType,
      command: command.trim(),
      aiProvider: selectedProvider,
      model: selectedModel,
    };

    onSubmit(promptData);
    setIsOpen(false);
    setCommand('');
    setSelectedTemplate(null);
  };

  const PackageTypeIcon = packageTypeIcons[packageType] || Code;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Code
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Code Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Templates & Configuration */}
          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Quick Templates</h3>
              <div className="grid gap-2">
                {quickTemplates.map((template) => {
                  const TemplateIcon = packageTypeIcons[template.packageType];
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                          : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <TemplateIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {template.description}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {template.packageType}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Package Type Selection */}
            <div>
              <Label className="text-sm font-semibold">Package Type</Label>
              <Select value={packageType} onValueChange={(value: PackageType) => setPackageType(value)}>
                <SelectTrigger className="mt-2">
                  <div className="flex items-center gap-2">
                    <PackageTypeIcon className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {packageTypes.map((type) => {
                    const Icon = packageTypeIcons[type.value] || Code;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - AI Provider & Input */}
          <div className="space-y-6">
            {/* AI Provider Selection */}
            <AIProviderSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              selectedFramework={selectedFramework}
              packageType={packageType}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
              onFrameworkChange={setSelectedFramework}
            />

            <Separator />

            {/* Command Input */}
            <div>
              <Label htmlFor="command" className="text-sm font-semibold">
                Describe what you want to build
              </Label>
              <Textarea
                id="command"
                placeholder={
                  selectedTemplate 
                    ? "Template selected - modify the description above or write your own..."
                    : "Describe your project in detail. Be specific about features, styling, functionality, and any special requirements..."
                }
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={6}
                className="mt-2 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                The more specific you are, the better the generated code will be.
              </p>
            </div>

            {/* Generation Summary */}
            {command && (
              <Card className="bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Generation Summary</h4>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div>Package Type: <span className="font-medium">{packageType}</span></div>
                    <div>AI Provider: <span className="font-medium">{selectedProvider}</span></div>
                    <div>Model: <span className="font-medium">{selectedModel}</span></div>
                    {['html', 'css', 'frontend', 'fullstack', 'component', 'landing', 'dashboard'].includes(packageType) && (
                      <div>CSS Framework: <span className="font-medium">{selectedFramework}</span></div>
                    )}
                    <div>Prompt Length: <span className="font-medium">{command.length} characters</span></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              setCommand('');
              setSelectedTemplate(null);
            }}
            disabled={isLoading}
          >
            Clear
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!command.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Code
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}