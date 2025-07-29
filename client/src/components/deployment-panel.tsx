import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project, Deployment, InsertDeployment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Rocket, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Settings, 
  Globe,
  Server,
  Database,
  Key,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

interface DeploymentPanelProps {
  project: Project;
}

export function DeploymentPanel({ project }: DeploymentPanelProps) {
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('vercel');
  const [envVars, setEnvVars] = useState<Record<string, string>>(project.envVars || {});
  const [showEnvValues, setShowEnvValues] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deployments for this project
  const { data: deployments = [], isLoading } = useQuery<Deployment[]>({
    queryKey: ['/api/deployments', project.id],
  });

  // Deploy project mutation
  const deployMutation = useMutation({
    mutationFn: async (data: InsertDeployment) => {
      const response = await apiRequest('POST', '/api/deployments', data);
      return await response.json() as Deployment;
    },
    onSuccess: (deployment) => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments', project.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowDeployDialog(false);
      toast({
        title: "Deployment Started",
        description: `Deploying to ${deployment.platform}...`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update environment variables mutation
  const updateEnvMutation = useMutation({
    mutationFn: async (newEnvVars: Record<string, string>) => {
      const response = await apiRequest('PATCH', `/api/projects/${project.id}`, {
        envVars: newEnvVars
      });
      return await response.json() as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Environment Variables Updated",
        description: "Your environment variables have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const platforms = [
    { 
      value: 'vercel', 
      label: 'Vercel', 
      icon: '▲',
      description: 'Best for frontend and serverless',
      features: ['Auto HTTPS', 'Global CDN', 'Zero config']
    },
    { 
      value: 'netlify', 
      label: 'Netlify', 
      icon: '🟢',
      description: 'JAMstack platform with CI/CD',
      features: ['Form handling', 'Functions', 'Split testing']
    },
    { 
      value: 'railway', 
      label: 'Railway', 
      icon: '🚂',
      description: 'Full-stack deployment platform',
      features: ['Database hosting', 'Auto scaling', 'Team collaboration']
    },
  ];

  const handleDeploy = () => {
    deployMutation.mutate({
      projectId: project.id,
      platform: selectedPlatform,
    });
  };

  const handleUpdateEnvVars = () => {
    updateEnvMutation.mutate(envVars);
  };

  const addEnvVar = () => {
    const key = `ENV_VAR_${Object.keys(envVars).length + 1}`;
    setEnvVars({ ...envVars, [key]: '' });
  };

  const removeEnvVar = (key: string) => {
    const newEnvVars = { ...envVars };
    delete newEnvVars[key];
    setEnvVars(newEnvVars);
  };

  const toggleEnvVisibility = (key: string) => {
    setShowEnvValues({ ...showEnvValues, [key]: !showEnvValues[key] });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'building':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'building':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deployment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deploy your project to the cloud</p>
        </div>
        
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Project
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deploy to Production</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="platform" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="platform">Platform</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="platform" className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Choose Deployment Platform</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Select the platform that best fits your project needs
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {platforms.map((platform) => (
                    <Card 
                      key={platform.value}
                      className={`cursor-pointer transition-colors ${
                        selectedPlatform === platform.value 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => setSelectedPlatform(platform.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="text-2xl">{platform.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {platform.label}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                              {platform.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {platform.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="environment" className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Environment Variables</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Configure environment variables for your deployment
                  </p>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Input
                        placeholder="KEY"
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const newEnvVars = { ...envVars };
                          delete newEnvVars[key];
                          newEnvVars[newKey] = value;
                          setEnvVars(newEnvVars);
                        }}
                        className="w-32"
                      />
                      <span className="text-slate-400">=</span>
                      <div className="flex-1 relative">
                        <Input
                          type={showEnvValues[key] ? "text" : "password"}
                          placeholder="value"
                          value={value}
                          onChange={(e) => setEnvVars({ ...envVars, [key]: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleEnvVisibility(key)}
                        >
                          {showEnvValues[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEnvVar(key)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={addEnvVar}
                  className="w-full mt-4"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Add Environment Variable
                </Button>
                
                <Button
                  onClick={handleUpdateEnvVars}
                  disabled={updateEnvMutation.isPending}
                  className="w-full"
                >
                  {updateEnvMutation.isPending ? "Saving..." : "Save Environment Variables"}
                </Button>
              </TabsContent>
              
              <TabsContent value="review" className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Deployment Summary</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Review your deployment configuration
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Project:</span>
                      <span>{project.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Platform:</span>
                      <span>{platforms.find(p => p.value === selectedPlatform)?.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Files:</span>
                      <span>{Object.keys(project.files).length} files</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Environment Variables:</span>
                      <span>{Object.keys(envVars).length} variables</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  onClick={handleDeploy}
                  disabled={deployMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {deployMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy Now
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Deployment Status */}
      {project.deploymentUrl && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-green-900 dark:text-green-100">
                <Globe className="h-5 w-5" />
                <span>Live Deployment</span>
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <a 
                href={project.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 dark:text-green-300 hover:underline font-mono text-sm"
              >
                {project.deploymentUrl}
              </a>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(project.deploymentUrl!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment History */}
      <div>
        <h4 className="font-medium text-slate-900 dark:text-white mb-3">Deployment History</h4>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : deployments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-2">🚀</div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                No deployments yet
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Deploy your project to see deployment history
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {platforms.find(p => p.value === deployment.platform)?.label}
                          </span>
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(deployment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {deployment.url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(deployment.url!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}