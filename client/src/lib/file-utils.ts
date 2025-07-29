import JSZip from 'jszip';

export function downloadAsZip(files: Record<string, string>, filename: string = 'generated-code') {
  const zip = new JSZip();
  
  // Add files to zip, excluding node_modules and other unwanted directories
  Object.entries(files).forEach(([filePath, content]) => {
    // Skip files in unwanted directories
    if (filePath.includes('node_modules/') || 
        filePath.includes('.git/') || 
        filePath.includes('dist/') ||
        filePath.includes('build/')) {
      return;
    }
    
    zip.file(filePath, content);
  });
  
  // Generate and download the zip file
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

export function getLanguageFromFileName(fileName: string): string {
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
    php: 'php',
    rb: 'ruby',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sql: 'sql',
  };
  return extensionMap[ext || ''] || 'text';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFileName(fileName: string): boolean {
  // Check for invalid characters in file names
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(fileName) && fileName.trim() !== '';
}

export function createFileStructurePreview(files: Record<string, string>): string {
  const paths = Object.keys(files).sort();
  let structure = '';
  const processedFolders = new Set<string>();
  
  paths.forEach(path => {
    const parts = path.split('/');
    let currentPath = '';
    
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const depth = index;
      const prefix = '  '.repeat(depth);
      
      if (isLast) {
        // It's a file
        structure += `${prefix}├── ${part}\n`;
      } else {
        // It's a folder
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!processedFolders.has(currentPath)) {
          structure += `${prefix}├── ${part}/\n`;
          processedFolders.add(currentPath);
        }
      }
    });
  });
  
  return structure;
}
