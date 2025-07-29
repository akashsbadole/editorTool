import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: string | null;
  onComplete: (files: Record<string, string>) => void;
}

interface StreamEvent {
  type: 'progress' | 'complete' | 'error';
  content?: string;
  files?: Record<string, string>;
  error?: string;
  done: boolean;
}

export function StreamingModal({ isOpen, onClose, promptId, onComplete }: StreamingModalProps) {
  const [streamContent, setStreamContent] = useState<string>('');
  const [status, setStatus] = useState<'connecting' | 'generating' | 'complete' | 'error'>('connecting');
  const [progress, setProgress] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [totalLines, setTotalLines] = useState(0);

  useEffect(() => {
    if (!isOpen || !promptId) {
      setStreamContent('');
      setStatus('connecting');
      setProgress(0);
      setFileCount(0);
      setTotalLines(0);
      return;
    }

    const eventSource = new EventSource(`/api/prompts/${promptId}/generate`);
    
    setStatus('connecting');
    setStreamContent('[INFO] Connecting to AI service...\n');

    eventSource.onopen = () => {
      setStatus('generating');
      setStreamContent(prev => prev + '[INFO] Connected! Starting code generation...\n');
    };

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        return;
      }

      try {
        const data: StreamEvent = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setStreamContent(prev => prev + (data.content || ''));
          // Update progress based on content length (rough estimate)
          const contentLength = streamContent.length;
          const estimatedProgress = Math.min((contentLength / 1000) * 100, 90);
          setProgress(estimatedProgress);
        } else if (data.type === 'complete') {
          setStatus('complete');
          setProgress(100);
          
          if (data.files) {
            const files = data.files;
            setFileCount(Object.keys(files).length);
            
            // Count total lines
            const lines = Object.values(files).reduce((total, content) => {
              return total + content.split('\n').length;
            }, 0);
            setTotalLines(lines);
            
            setStreamContent(prev => 
              prev + `\n[SUCCESS] Generation complete! Created ${Object.keys(files).length} files with ${lines} lines of code.\n`
            );
            
            onComplete(files);
          }
        } else if (data.type === 'error') {
          setStatus('error');
          setStreamContent(prev => 
            prev + `\n[ERROR] ${data.error || 'Generation failed'}\n`
          );
        }
      } catch (error) {
        console.error('Error parsing stream data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setStatus('error');
      setStreamContent(prev => prev + '\n[ERROR] Connection lost or generation failed\n');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, promptId, onComplete]);

  const handleClose = () => {
    setStreamContent('');
    setStatus('connecting');
    setProgress(0);
    onClose();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
      case 'generating':
        return <div className="animate-spin w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to AI service...';
      case 'generating':
        return 'Generating code...';
      case 'complete':
        return 'Generation complete!';
      case 'error':
        return 'Generation failed';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getStatusIcon()}
            <span>AI Code Generation</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4">
          {/* Progress Bar */}
          {status === 'generating' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Status */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-slate-900 dark:text-white">
              {getStatusText()}
            </span>
            {status === 'generating' && (
              <span className="text-slate-500 dark:text-slate-400">
                This may take a few moments...
              </span>
            )}
          </div>

          {/* Streaming Content */}
          <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-y-auto">
            <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
              {streamContent}
              {status === 'generating' && (
                <span className="animate-pulse text-slate-500">▊</span>
              )}
            </pre>
          </div>

          {/* Stats */}
          {(fileCount > 0 || totalLines > 0) && (
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-t pt-4">
              <div className="space-x-4">
                {fileCount > 0 && (
                  <span>Generated <span className="font-medium text-slate-900 dark:text-white">{fileCount}</span> files</span>
                )}
                {totalLines > 0 && (
                  <span>• <span className="font-medium text-slate-900 dark:text-white">{totalLines}</span> lines of code</span>
                )}
              </div>
              
              {status === 'complete' && (
                <Button 
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Generated Code
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
