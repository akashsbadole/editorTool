import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prompt, packageTypes } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Clock, FileText, Package } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReusePrompt: (prompt: Prompt) => void;
}

export function HistoryModal({ isOpen, onClose, onReusePrompt }: HistoryModalProps) {
  const { data: prompts = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ['/api/prompts'],
    enabled: isOpen,
  });

  const getPackageTypeLabel = (packageType: string) => {
    const type = packageTypes.find(t => t.value === packageType);
    return type?.label || packageType;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'generating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getFileCount = (files: Record<string, string>) => {
    return Object.keys(files).length;
  };

  const getTotalLines = (files: Record<string, string>) => {
    return Object.values(files).reduce((total, content) => {
      return total + content.split('\n').length;
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Prompt History</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Loading history...</span>
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No prompts yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Generate your first code to see it in the history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Command */}
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white text-lg mb-2">
                            {prompt.command}
                          </h3>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Package className="h-3 w-3" />
                              <span>{getPackageTypeLabel(prompt.packageType)}</span>
                            </div>
                            
                            {prompt.status === 'completed' && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-3 w-3" />
                                  <span>{getFileCount(prompt.generatedFiles)} files</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <span>{getTotalLines(prompt.generatedFiles)} lines</span>
                                </div>
                              </>
                            )}
                            
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          <Badge className={getStatusColor(prompt.status)}>
                            {prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
                          </Badge>
                        </div>

                        {/* Generated Files Preview */}
                        {prompt.status === 'completed' && Object.keys(prompt.generatedFiles).length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Generated Files:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(prompt.generatedFiles).slice(0, 5).map((fileName) => (
                                <Badge
                                  key={fileName}
                                  variant="outline"
                                  className="text-xs font-mono"
                                >
                                  {fileName}
                                </Badge>
                              ))}
                              {Object.keys(prompt.generatedFiles).length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{Object.keys(prompt.generatedFiles).length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="ml-4">
                        {prompt.status === 'completed' && (
                          <Button
                            onClick={() => {
                              onReusePrompt(prompt);
                              onClose();
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            Reuse
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
