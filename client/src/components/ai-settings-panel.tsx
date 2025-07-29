import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Settings, UpdateSettings } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  Bot,
  Code,
  Paintbrush,
  TestTube,
} from "lucide-react";

interface AISettingsPanelProps {
  children: React.ReactNode;
}

export function AISettingsPanel({ children }: AISettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateSettings>>({});

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    enabled: open,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: UpdateSettings) =>
      apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings updated successfully" });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings && open) {
      setFormData({
        defaultAiProvider: settings.defaultAiProvider,
        ollamaUrl: settings.ollamaUrl,
        ollamaDefaultModel: settings.ollamaDefaultModel,
        openaiApiKey: settings.openaiApiKey,
        openaiDefaultModel: settings.openaiDefaultModel,
        openaiOrganization: settings.openaiOrganization,
        anthropicApiKey: settings.anthropicApiKey,
        anthropicDefaultModel: settings.anthropicDefaultModel,
        mistralApiKey: settings.mistralApiKey,
        mistralDefaultModel: settings.mistralDefaultModel,
        defaultCssFramework: settings.defaultCssFramework,
        enableFigmaIntegration: settings.enableFigmaIntegration,
        figmaAccessToken: settings.figmaAccessToken,
        codeStyle: settings.codeStyle,
        typescript: settings.typescript,
        includeComments: settings.includeComments,
        generateTests: settings.generateTests,
      });
    }
  }, [settings, open]);

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const updateField = (field: keyof UpdateSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            AI Integration Settings
          </DialogTitle>
          <DialogDescription>
            Configure AI providers, code generation preferences, and development
            tools.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Provider Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Provider Configuration
                </CardTitle>
                <CardDescription>
                  Select your preferred AI provider and configure connection
                  settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultProvider">Default AI Provider</Label>
                  <Select
                    value={formData.defaultAiProvider}
                    onValueChange={(value) =>
                      updateField("defaultAiProvider", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ollama">Ollama (Local)</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">
                        Anthropic Claude
                      </SelectItem>
                      <SelectItem value="mistral">Mistral AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ollama Settings */}
                <div className="space-y-3 border rounded-lg p-4">
                  <h4 className="font-medium">Ollama Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ollamaUrl">Ollama URL</Label>
                      <Input
                        id="ollamaUrl"
                        value={formData.ollamaUrl || ""}
                        onChange={(e) =>
                          updateField("ollamaUrl", e.target.value)
                        }
                        placeholder="http://localhost:11434"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ollamaModel">Default Model</Label>
                      <Input
                        id="ollamaModel"
                        value={formData.ollamaDefaultModel || ""}
                        onChange={(e) =>
                          updateField("ollamaDefaultModel", e.target.value)
                        }
                        placeholder="deepseek-coder:6.7b"
                      />
                    </div>
                  </div>
                </div>

                {/* OpenAI Settings */}
                <div className="space-y-3 border rounded-lg p-4">
                  <h4 className="font-medium">OpenAI Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openaiKey">API Key</Label>
                      <Input
                        id="openaiKey"
                        type="password"
                        value={formData.openaiApiKey || ""}
                        onChange={(e) =>
                          updateField("openaiApiKey", e.target.value)
                        }
                        placeholder="sk-..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openaiModel">Default Model</Label>
                      <Select
                        value={formData.openaiDefaultModel || ""}
                        onValueChange={(value) =>
                          updateField("openaiDefaultModel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4-turbo">
                            GPT-4 Turbo
                          </SelectItem>
                          <SelectItem value="gpt-3.5-turbo">
                            GPT-3.5 Turbo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openaiOrg">
                      Organization ID (Optional)
                    </Label>
                    <Input
                      id="openaiOrg"
                      value={formData.openaiOrganization || ""}
                      onChange={(e) =>
                        updateField("openaiOrganization", e.target.value)
                      }
                      placeholder="org-..."
                    />
                  </div>
                </div>

                {/* Anthropic Settings */}
                <div className="space-y-3 border rounded-lg p-4">
                  <h4 className="font-medium">
                    Anthropic Claude Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="anthropicKey">API Key</Label>
                      <Input
                        id="anthropicKey"
                        type="password"
                        value={formData.anthropicApiKey || ""}
                        onChange={(e) =>
                          updateField("anthropicApiKey", e.target.value)
                        }
                        placeholder="sk-ant-..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anthropicModel">Default Model</Label>
                      <Select
                        value={formData.anthropicDefaultModel || ""}
                        onValueChange={(value) =>
                          updateField("anthropicDefaultModel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-sonnet-4-20250514">
                            Claude 4.0 Sonnet
                          </SelectItem>
                          <SelectItem value="claude-3-7-sonnet-20250219">
                            Claude 3.7 Sonnet
                          </SelectItem>
                          <SelectItem value="claude-3-5-sonnet-20241022">
                            Claude 3.5 Sonnet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Mistral Settings */}
                <div className="space-y-3 border rounded-lg p-4">
                  <h4 className="font-medium">Mistral AI Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mistralKey">API Key</Label>
                      <Input
                        id="mistralKey"
                        type="password"
                        value={formData.mistralApiKey || ""}
                        onChange={(e) =>
                          updateField("mistralApiKey", e.target.value)
                        }
                        placeholder="..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mistralModel">Default Model</Label>
                      <Select
                        value={formData.mistralDefaultModel || ""}
                        onValueChange={(value) =>
                          updateField("mistralDefaultModel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mistral-large-latest">
                            Mistral Large
                          </SelectItem>
                          <SelectItem value="mistral-medium-latest">
                            Mistral Medium
                          </SelectItem>
                          <SelectItem value="mistral-small-latest">
                            Mistral Small
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Generation Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Generation Preferences
                </CardTitle>
                <CardDescription>
                  Configure how code is generated and formatted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cssFramework">Default CSS Framework</Label>
                    <Select
                      value={formData.defaultCssFramework || ""}
                      onValueChange={(value) =>
                        updateField("defaultCssFramework", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tailwindcss">
                          Tailwind CSS
                        </SelectItem>
                        <SelectItem value="bootstrap">Bootstrap</SelectItem>
                        <SelectItem value="vanilla">Vanilla CSS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codeStyle">Code Style</Label>
                    <Select
                      value={formData.codeStyle || ""}
                      onValueChange={(value) => updateField("codeStyle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prettier">Prettier</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="airbnb">Airbnb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="typescript">Use TypeScript</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate TypeScript code by default
                      </p>
                    </div>
                    <Switch
                      id="typescript"
                      checked={formData.typescript || false}
                      onCheckedChange={(checked) =>
                        updateField("typescript", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="comments">Include Comments</Label>
                      <p className="text-sm text-muted-foreground">
                        Add explanatory comments to generated code
                      </p>
                    </div>
                    <Switch
                      id="comments"
                      checked={formData.includeComments || false}
                      onCheckedChange={(checked) =>
                        updateField("includeComments", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tests">Generate Tests</Label>
                      <p className="text-sm text-muted-foreground">
                        Include test files for generated code
                      </p>
                    </div>
                    <Switch
                      id="tests"
                      checked={formData.generateTests || false}
                      onCheckedChange={(checked) =>
                        updateField("generateTests", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Figma Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  Figma Integration
                </CardTitle>
                <CardDescription>
                  Connect Figma for design-to-code conversion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="figmaIntegration">
                      Enable Figma Integration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow conversion of Figma designs to code
                    </p>
                  </div>
                  <Switch
                    id="figmaIntegration"
                    checked={formData.enableFigmaIntegration || false}
                    onCheckedChange={(checked) =>
                      updateField("enableFigmaIntegration", checked)
                    }
                  />
                </div>

                {formData.enableFigmaIntegration && (
                  <div className="space-y-2">
                    <Label htmlFor="figmaToken">Figma Access Token</Label>
                    <Input
                      id="figmaToken"
                      type="password"
                      value={formData.figmaAccessToken || ""}
                      onChange={(e) =>
                        updateField("figmaAccessToken", e.target.value)
                      }
                      placeholder="figd_..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Get your access token from Figma → Account Settings →
                      Personal Access Tokens
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending
                  ? "Saving..."
                  : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
