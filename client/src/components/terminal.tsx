import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Terminal as TerminalIcon, 
  Play, 
  Square, 
  Trash2, 
  Copy,
  Download,
  Upload,
  Settings
} from "lucide-react";

interface TerminalProps {
  projectId: string;
  files: Record<string, string>;
}

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  timestamp: Date;
}

export function Terminal({ projectId, files }: TerminalProps) {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [workingDirectory, setWorkingDirectory] = useState('/project');
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new output appears
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  // Built-in commands
  const builtInCommands = {
    ls: () => {
      const fileList = Object.keys(files).join('\n');
      return fileList || 'No files found';
    },
    pwd: () => workingDirectory,
    clear: () => {
      setCommands([]);
      return '';
    },
    cat: (filename: string) => {
      if (!filename) return 'Usage: cat <filename>';
      if (files[filename]) {
        return files[filename];
      }
      return `cat: ${filename}: No such file or directory`;
    },
    tree: () => {
      const paths = Object.keys(files).sort();
      let tree = 'project/\n';
      const processed = new Set<string>();
      
      paths.forEach(path => {
        const parts = path.split('/');
        let currentPath = '';
        
        parts.forEach((part, index) => {
          const isLast = index === parts.length - 1;
          const depth = index;
          const prefix = '  '.repeat(depth);
          
          if (isLast) {
            tree += `${prefix}├── ${part}\n`;
          } else {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            if (!processed.has(currentPath)) {
              tree += `${prefix}├── ${part}/\n`;
              processed.add(currentPath);
            }
          }
        });
      });
      
      return tree;
    },
    help: () => {
      return `Available commands:
ls          - List files
pwd         - Print working directory
cat <file>  - Display file contents
tree        - Show file tree
clear       - Clear terminal
help        - Show this help
npm install - Install dependencies
npm run dev - Start development server
npm test    - Run tests
npm build   - Build project`;
    },
  };

  // Simulate npm and other commands
  const simulateCommand = async (cmd: string): Promise<string> => {
    const [command, ...args] = cmd.trim().split(' ');
    
    // Handle built-in commands
    if (command in builtInCommands) {
      const handler = builtInCommands[command as keyof typeof builtInCommands];
      if (typeof handler === 'function') {
        return handler(args[0]);
      }
    }
    
    // Simulate common development commands
    switch (command) {
      case 'npm':
        if (args[0] === 'install') {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return `npm install
          
added 1337 packages from 952 contributors and audited 1337 packages in 2.1s
found 0 vulnerabilities`;
        }
        if (args[0] === 'run' && args[1] === 'dev') {
          return `> dev
> vite

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  
  ready - started server on 0.0.0.0:3000, url: http://localhost:3000`;
        }
        if (args[0] === 'test') {
          return `> test
> jest

 PASS  src/App.test.tsx
 PASS  src/utils.test.ts

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        2.51 s`;
        }
        if (args[0] === 'run' && args[1] === 'build') {
          await new Promise(resolve => setTimeout(resolve, 3000));
          return `> build
> vite build

✓ 89 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-4a9d8c7e.css   1.32 kB │ gzip:  0.77 kB
dist/assets/index-b2a8f1d5.js   64.33 kB │ gzip: 20.85 kB
✓ built in 2.98s`;
        }
        return `npm: command not found. Available: install, run dev, test, build`;
        
      case 'git':
        if (args[0] === 'status') {
          return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   ${Object.keys(files)[0] || 'src/App.tsx'}

no changes added to commit (use "git add ." or "git commit -a")`;
        }
        if (args[0] === 'init') {
          return 'Initialized empty Git repository in /project/.git/';
        }
        return `git ${args.join(' ')}: simulated command`;
        
      case 'python':
      case 'python3':
        if (args[0]) {
          return `Python 3.9.0
Running ${args[0]}...
Hello, World!`;
        }
        return 'Python 3.9.0 (default, Oct  9 2020, 15:07:18)';
        
      case 'node':
        return 'v18.17.0';
        
      case 'version':
      case '--version':
        return 'CodeCraft Terminal v1.0.0';
        
      default:
        return `${command}: command not found
Type 'help' for available commands`;
    }
  };

  const executeCommand = async () => {
    if (!currentCommand.trim() || isRunning) return;
    
    const commandId = Date.now().toString();
    const newCommand: TerminalCommand = {
      id: commandId,
      command: currentCommand,
      output: '',
      status: 'running',
      timestamp: new Date(),
    };
    
    setCommands(prev => [...prev, newCommand]);
    setCurrentCommand('');
    setIsRunning(true);
    
    try {
      const output = await simulateCommand(currentCommand);
      
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output, status: 'completed' as const }
            : cmd
        )
      );
    } catch (error) {
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output: 'Command failed', status: 'error' as const }
            : cmd
        )
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const clearTerminal = () => {
    setCommands([]);
  };

  const copyOutput = async (output: string) => {
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Output copied to clipboard.",
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
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TerminalIcon className="h-5 w-5" />
            <span>Terminal</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-mono">
              {workingDirectory}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 bg-slate-900 dark:bg-slate-950 rounded p-4 overflow-y-auto font-mono text-sm"
        >
          {/* Welcome Message */}
          {commands.length === 0 && (
            <div className="text-green-400 mb-4">
              <div>CodeCraft Terminal v1.0.0</div>
              <div className="text-slate-500">Type 'help' for available commands</div>
            </div>
          )}
          
          {/* Command History */}
          {commands.map((cmd) => (
            <div key={cmd.id} className="mb-4">
              {/* Command Input */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-400">$</span>
                <span className="text-white">{cmd.command}</span>
                <Badge className={getStatusColor(cmd.status)}>
                  {cmd.status}
                </Badge>
                {cmd.status === 'completed' && cmd.output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyOutput(cmd.output)}
                    className="h-4 w-4 p-0 text-slate-400 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Command Output */}
              {cmd.output && (
                <div className={`whitespace-pre-wrap text-slate-300 pl-4 border-l-2 border-slate-700 ${
                  cmd.status === 'error' ? 'text-red-400' : ''
                }`}>
                  {cmd.output}
                </div>
              )}
              
              {/* Running Indicator */}
              {cmd.status === 'running' && (
                <div className="flex items-center space-x-2 text-blue-400 pl-4">
                  <div className="animate-spin w-3 h-3 border border-blue-400 border-t-transparent rounded-full"></div>
                  <span>Running...</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Current Input */}
          <div className="flex items-center space-x-2">
            <span className="text-green-400">$</span>
            <Input
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter command..."
              disabled={isRunning}
              className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
            <Button
              onClick={executeCommand}
              disabled={isRunning || !currentCommand.trim()}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-6"
            >
              {isRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Quick Commands */}
        <div className="flex flex-wrap gap-2">
          {['ls', 'npm install', 'npm run dev', 'git status', 'help'].map((cmd) => (
            <Button
              key={cmd}
              variant="outline"
              size="sm"
              onClick={() => setCurrentCommand(cmd)}
              disabled={isRunning}
              className="text-xs"
            >
              {cmd}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}