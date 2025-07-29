import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  cssFrameworks, 
  CSSFramework,
  InsertPrompt 
} from "@shared/schema";
import { 
  Palette, 
  Link, 
  Upload, 
  Code, 
  Eye,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from "lucide-react";

interface FigmaToCodeGeneratorProps {
  projectId?: string;
  onSubmit: (prompt: InsertPrompt) => void;
  isLoading?: boolean;
}

const figmaCodeOptions = [
  {
    id: 'responsive-react',
    name: 'Responsive React Component',
    description: 'Generate responsive React component with TypeScript',
    framework: 'React + TypeScript',
    features: ['Responsive design', 'Component props', 'CSS modules']
  },
  {
    id: 'html-css',
    name: 'HTML + CSS',
    description: 'Pure HTML with modern CSS',
    framework: 'HTML5 + CSS3',
    features: ['Semantic markup', 'CSS Grid/Flexbox', 'Mobile-first']
  },
  {
    id: 'vue-component',
    name: 'Vue Component',
    description: 'Vue.js single file component',
    framework: 'Vue.js 3',
    features: ['Composition API', 'Scoped styles', 'TypeScript support']
  },
  {
    id: 'flutter-widget',
    name: 'Flutter Widget',
    description: 'Flutter widget for mobile apps',
    framework: 'Flutter/Dart',
    features: ['Material Design', 'Responsive layout', 'State management']
  }
];

export function FigmaToCodeGenerator({ 
  projectId, 
  onSubmit, 
  isLoading = false 
}: FigmaToCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [selectedOption, setSelectedOption] = useState('responsive-react');
  const [cssFramework, setCssFramework] = useState<CSSFramework>('tailwindcss');
  const [customInstructions, setCustomInstructions] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'url' | 'upload'>('url');

  const validateFigmaUrl = (url: string): boolean => {
    return url.includes('figma.com') && (url.includes('/file/') || url.includes('/proto/'));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
    }
  };

  const handleSubmit = () => {
    if (inputMethod === 'url' && !figmaUrl.trim()) {
      return;
    }
    if (inputMethod === 'upload' && !uploadedImage) {
      return;
    }

    const selectedConfig = figmaCodeOptions.find(opt => opt.id === selectedOption);
    
    let command = '';
    if (inputMethod === 'url') {
      command = `Convert this Figma design to ${selectedConfig?.framework || 'React'} code: ${figmaUrl}

Generate a ${selectedConfig?.name.toLowerCase()} with the following requirements:
- Use ${cssFramework} for styling
- Make it fully responsive (mobile, tablet, desktop)
- Include proper accessibility attributes
- Use modern best practices and clean code structure

${selectedConfig?.features ? `Key features to implement:
${selectedConfig.features.map(f => `- ${f}`).join('\n')}` : ''}

${customInstructions ? `Additional instructions:
${customInstructions}` : ''}

Please provide complete, production-ready code with proper file structure.`;
    } else {
      command = `Convert this design image to ${selectedConfig?.framework || 'React'} code.

Generate a ${selectedConfig?.name.toLowerCase()} that matches the uploaded design with:
- ${cssFramework} for styling
- Responsive layout (mobile-first approach)
- Clean, semantic HTML structure
- Modern CSS practices
- Accessibility considerations

${customInstructions ? `Additional requirements:
${customInstructions}` : ''}

Analyze the design and create pixel-perfect, responsive code.`;
    }

    const promptData: InsertPrompt = {
      projectId: projectId || null,
      packageType: 'figma',
      command,
      aiProvider: 'claude', // Claude is better for design analysis
      model: 'claude-sonnet-4-20250514',
    };

    onSubmit(promptData);
    setIsOpen(false);
    setFigmaUrl('');
    setUploadedImage(null);
    setCustomInstructions('');
  };

  const selectedConfig = figmaCodeOptions.find(opt => opt.id === selectedOption);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="h-4 w-4" />
          Figma to Code
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Figma to Code Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Input Method Selection */}
          <div>
            <Label className="text-sm font-semibold">Design Input</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Card 
                className={`cursor-pointer transition-all ${
                  inputMethod === 'url' 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setInputMethod('url')}
              >
                <CardContent className="p-3 text-center">
                  <Link className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-sm">Figma URL</p>
                  <p className="text-xs text-slate-500">Paste Figma link</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${
                  inputMethod === 'upload' 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setInputMethod('upload')}
              >
                <CardContent className="p-3 text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium text-sm">Upload Image</p>
                  <p className="text-xs text-slate-500">Upload design screenshot</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Figma URL Input */}
          {inputMethod === 'url' && (
            <div>
              <Label htmlFor="figma-url">Figma Design URL</Label>
              <Input
                id="figma-url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className="mt-2"
              />
              <div className="flex items-center gap-2 mt-2">
                {figmaUrl && validateFigmaUrl(figmaUrl) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Valid Figma URL</span>
                  </>
                ) : figmaUrl ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Invalid Figma URL</span>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Image Upload */}
          {inputMethod === 'upload' && (
            <div>
              <Label htmlFor="design-upload">Design Image</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="design-upload" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadedImage ? (
                        <>
                          <ImageIcon className="w-8 h-8 mb-2 text-green-500" />
                          <p className="text-sm text-green-600 font-medium">{uploadedImage.name}</p>
                          <p className="text-xs text-slate-500">Click to change</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-slate-500">PNG, JPG or WEBP (MAX. 10MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      id="design-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Code Generation Options */}
          <div>
            <Label className="text-sm font-semibold">Code Output Type</Label>
            <div className="grid gap-3 mt-3">
              {figmaCodeOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    selectedOption === option.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{option.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{option.framework}</Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Code className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {option.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CSS Framework Selection */}
          <div>
            <Label>CSS Framework</Label>
            <Select value={cssFramework} onValueChange={(value: CSSFramework) => setCssFramework(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cssFrameworks.map((framework) => (
                  <SelectItem key={framework.value} value={framework.value}>
                    {framework.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Instructions */}
          <div>
            <Label htmlFor="custom-instructions">Additional Instructions (Optional)</Label>
            <Textarea
              id="custom-instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Specify any additional requirements, color schemes, animations, or special functionality..."
              rows={3}
              className="mt-2 resize-none"
            />
          </div>

          {/* Generation Preview */}
          {(figmaUrl || uploadedImage) && selectedConfig && (
            <Card className="bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Generation Preview
                </h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div>Output: <span className="font-medium">{selectedConfig.name}</span></div>
                  <div>Framework: <span className="font-medium">{selectedConfig.framework}</span></div>
                  <div>Styling: <span className="font-medium">{cssFramework}</span></div>
                  <div>
                    Input: <span className="font-medium">
                      {inputMethod === 'url' ? 'Figma URL' : uploadedImage?.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning for Figma Integration */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Figma-to-code conversion works best with simple to medium complexity designs. 
              Complex animations, interactions, or very detailed designs may require manual refinement.
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              setFigmaUrl('');
              setUploadedImage(null);
              setCustomInstructions('');
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
              disabled={
                (inputMethod === 'url' && (!figmaUrl.trim() || !validateFigmaUrl(figmaUrl))) ||
                (inputMethod === 'upload' && !uploadedImage) ||
                isLoading
              }
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                  Converting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Convert to Code
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}