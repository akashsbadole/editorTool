import { useState } from "react";
import { FileNode } from "@shared/schema";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: Record<string, string>;
  selectedFile?: string;
  onFileSelect: (path: string, content: string) => void;
}

export function FileTree({ files, selectedFile, onFileSelect }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));

  // Convert flat file structure to tree
  const buildFileTree = (files: Record<string, string>): FileNode[] => {
    const tree: FileNode[] = [];
    const folderMap: Record<string, FileNode> = {};

    // Sort files to ensure folders come first
    const sortedFiles = Object.entries(files).sort(([a], [b]) => {
      const aIsFolder = a.includes('/');
      const bIsFolder = b.includes('/');
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.localeCompare(b);
    });

    for (const [filePath, content] of sortedFiles) {
      const parts = filePath.split('/');
      let currentLevel = tree;
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isLast) {
          // It's a file
          currentLevel.push({
            name: part,
            type: 'file',
            path: filePath,
            content,
            language: getLanguageFromExtension(part),
          });
        } else {
          // It's a folder
          let folder = folderMap[currentPath];
          if (!folder) {
            folder = {
              name: part,
              type: 'folder',
              path: currentPath,
              children: [],
            };
            folderMap[currentPath] = folder;
            currentLevel.push(folder);
          }
          currentLevel = folder.children!;
        }
      }
    }

    return tree;
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const extensionMap: Record<string, string> = {
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
    return extensionMap[ext || ''] || 'text';
  };

  const getFileIcon = (fileName: string, isFolder: boolean = false): string => {
    if (isFolder) return '📁';
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      tsx: '⚛️',
      jsx: '⚛️',
      ts: '📘',
      js: '📜',
      css: '🎨',
      html: '🌐',
      json: '📋',
      py: '🐍',
      go: '🐹',
      rs: '🦀',
      java: '☕',
      md: '📝',
      txt: '📄',
    };
    return iconMap[ext || ''] || '📄';
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = node.type === 'file' && selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer text-sm transition-colors",
            isSelected && "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500",
            depth > 0 && "ml-4"
          )}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path, node.content || '');
            }
          }}
        >
          {node.type === 'folder' && (
            <>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1 text-slate-500" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1 text-slate-500" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 mr-2 text-yellow-600" />
              ) : (
                <Folder className="h-4 w-4 mr-2 text-yellow-600" />
              )}
            </>
          )}
          {node.type === 'file' && (
            <span className="mr-2">{getFileIcon(node.name)}</span>
          )}
          <span className={cn(
            "flex-1 truncate",
            isSelected
              ? "text-slate-900 dark:text-white font-medium"
              : "text-slate-700 dark:text-slate-300"
          )}>
            {node.name}
          </span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const fileTree = buildFileTree(files);

  if (Object.keys(files).length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        <div className="text-4xl mb-2">📂</div>
        <p className="text-sm">No files generated yet</p>
        <p className="text-xs mt-1">Generate code to see files here</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
        <Folder className="h-4 w-4 mr-2" />
        Generated Files
      </h3>
      
      <div className="space-y-1 file-tree-scroll max-h-[calc(100vh-200px)] overflow-y-auto">
        {fileTree.map(node => renderNode(node))}
      </div>
    </div>
  );
}
