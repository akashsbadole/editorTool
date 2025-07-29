import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { aiProviders, cssFrameworks, AIProvider, CSSFramework, PackageType } from "@shared/schema";
import { 
  Brain, 
  Zap, 
  Globe, 
  Lock, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Settings
} from "lucide-react";

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  selectedModel: string;
  selectedFramework?: CSSFramework;
  packageType: PackageType;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  onFrameworkChange?: (framework: CSSFramework) => void;
}

export function AIProviderSelector({
  selectedProvider,
  selectedModel,
  selectedFramework,
  packageType,
  onProviderChange,
  onModelChange,
  onFrameworkChange
}: AIProviderSelectorProps) {
  const [expandedProvider, setExpandedProvider] = useState<AIProvider | null>(null);

  const currentProvider = aiProviders.find(p => p.value === selectedProvider);
  const availableModels = currentProvider?.models || [];
  
  // Show CSS framework selector for relevant package types
  const showFrameworkSelector = ['html', 'css', 'frontend', 'fullstack', 'component', 'landing', 'dashboard'].includes(packageType);

  const getProviderIcon = useCallback((provider: AIProvider) => {
    switch (provider) {
      case 'ollama':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'openai':
        return <Sparkles className="h-4 w-4 text-green-600" />;
      case 'claude':
        return <Zap className="h-4 w-4 text-purple-600" />;
      case 'mistral':
        return <Globe className="h-4 w-4 text-orange-600" />;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const getProviderStatus = useCallback((provider: AIProvider) => {
    // This would typically check environment variables or API connectivity
    switch (provider) {
      case 'ollama':
        return { status: 'available', message: 'Local AI model' };
      case 'openai':
        return { status: 'requires-key', message: 'Requires API key' };
      case 'claude':
        return { status: 'requires-key', message: 'Requires API key' };
      case 'mistral':
        return { status: 'requires-key', message: 'Requires API key' };
      default:
        return { status: 'unknown', message: 'Status unknown' };
    }
  }, []);

  const getProviderDescription = useCallback((provider: AIProvider) => {
    switch (provider) {
      case 'ollama':
        return 'Run AI models locally on your machine. No API key required, but requires local installation.';
      case 'openai':
        return 'Industry-leading AI models from OpenAI. Excellent for general-purpose code generation.';
      case 'claude':
        return 'Advanced AI from Anthropic. Excels at understanding context and following complex instructions.';
      case 'mistral':
        return 'Open-source AI models with strong coding capabilities and competitive performance.';
      default:
        return 'AI provider for code generation.';
    }
  }, []);

  const handleProviderSelect = (provider: AIProvider) => {
    onProviderChange(provider);
    const newProvider = aiProviders.find(p => p.value === provider);
    if (newProvider && newProvider.models.length > 0) {
      onModelChange(newProvider.models[0]);
    }
    setExpandedProvider(null);
  };

  return (
    <div className="space-y-4">
      {/* AI Provider Selection */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          AI Provider
        </h3>
        
        <div className="grid gap-3">
          {aiProviders.map((provider) => {
            const status = getProviderStatus(provider.value);
            const isSelected = selectedProvider === provider.value;
            const isExpanded = expandedProvider === provider.value;
            
            return (
              <Card 
                key={provider.value}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => isSelected ? setExpandedProvider(isExpanded ? null : provider.value) : handleProviderSelect(provider.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getProviderIcon(provider.value)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {provider.label}
                        </h4>
                        
                        <div className="flex items-center space-x-2">
                          {status.status === 'available' && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Ready
                            </Badge>
                          )}
                          {status.status === 'requires-key' && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              <Lock className="h-3 w-3 mr-1" />
                              API Key
                            </Badge>
                          )}
                          {isSelected && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedProvider(isExpanded ? null : provider.value);
                              }}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getProviderDescription(provider.value)}
                      </p>
                      
                      {/* Expanded Options */}
                      {isSelected && isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Model
                              </label>
                              <Select value={selectedModel} onValueChange={onModelChange}>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableModels.map((model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {status.status === 'requires-key' && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  This provider requires an API key. Make sure to configure your environment variables.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CSS Framework Selection (for relevant package types) */}
      {showFrameworkSelector && onFrameworkChange && (
        <>
          <Separator />
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              CSS Framework
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Choose a CSS framework for styling (applies to HTML, CSS, and UI components)
            </p>
            
            <Select value={selectedFramework} onValueChange={onFrameworkChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select CSS framework..." />
              </SelectTrigger>
              <SelectContent>
                {cssFrameworks.map((framework) => (
                  <SelectItem key={framework.value} value={framework.value}>
                    {framework.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedFramework && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {cssFrameworks.find(f => f.value === selectedFramework)?.label}
                </Badge>
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Model Selection for Selected Provider */}
      {!expandedProvider && selectedProvider && availableModels.length > 1 && (
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Quick Model Selection
          </label>
          <div className="flex flex-wrap gap-2">
            {availableModels.slice(0, 4).map((model) => (
              <Button
                key={model}
                variant={selectedModel === model ? "default" : "outline"}
                size="sm"
                onClick={() => onModelChange(model)}
                className="text-xs"
              >
                {model.split('-')[0] || model}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}