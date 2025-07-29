import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  fileName: string;
  content: string;
  language: string;
  theme?: "light" | "dark";
  readOnly?: boolean;
  onContentChange?: (content: string) => void;
}

export function CodeEditor({
  fileName,
  content,
  language,
  theme = "light",
  readOnly = true,
  onContentChange,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editorRef.current) {
      // Configure Monaco Editor
      monaco.editor.defineTheme("custom-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#1e293b",
          "editorLineNumber.foreground": "#94a3b8",
          "editor.selectionBackground": "#e2e8f0",
          "editor.lineHighlightBackground": "#f8fafc",
        },
      });

      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#0f172a",
          "editor.foreground": "#e2e8f0",
          "editorLineNumber.foreground": "#64748b",
          "editor.selectionBackground": "#334155",
          "editor.lineHighlightBackground": "#1e293b",
        },
      });

      const editorInstance = monaco.editor.create(editorRef.current, {
        value: content,
        language: getMonacoLanguage(language),
        theme: theme === "dark" ? "custom-dark" : "custom-light",
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        automaticLayout: true,
        wordWrap: "on",
        folding: true,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        renderWhitespace: "selection",
        tabSize: 2,
        insertSpaces: true,
      });

      setEditor(editorInstance);

      if (onContentChange) {
        editorInstance.onDidChangeModelContent(() => {
          onContentChange(editorInstance.getValue());
        });
      }

      return () => {
        editorInstance.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (editor) {
      editor.setValue(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      monaco.editor.setTheme(theme === "dark" ? "custom-dark" : "custom-light");
    }
  }, [theme, editor]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Code copied!",
        description: "The code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return '⚛️';
      case 'ts':
        return '📘';
      case 'js':
        return '📜';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      case 'json':
        return '📋';
      default:
        return '📄';
    }
  };

  const getLanguageLabel = (lang: string) => {
    const langMap: Record<string, string> = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      css: 'CSS',
      html: 'HTML',
      json: 'JSON',
      python: 'Python',
      go: 'Go',
      rust: 'Rust',
      java: 'Java',
    };
    return langMap[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  return (
    <div className={cn(
      "flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none border-0"
    )}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getFileTypeIcon(fileName)}</span>
          <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
            {fileName}
          </span>
          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
            {getLanguageLabel(language)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-1" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-1" />
            )}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-[400px]">
        <div ref={editorRef} className="h-full w-full" />
      </div>
    </div>
  );
}

function getMonacoLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    tsx: 'typescript',
    jsx: 'javascript',
    ts: 'typescript',
    js: 'javascript',
    css: 'css',
    html: 'html',
    json: 'json',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
  };
  
  return languageMap[language] || language;
}
