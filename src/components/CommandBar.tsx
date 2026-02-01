import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useNotes, useBookmarks, useTasks } from '@/hooks/useStore';
import { addActivity, generateId } from '@/lib/storage';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Bookmark,
  CheckSquare,
  Plus,
  Network,
  Settings,
  Terminal,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedCommand {
  command: string;
  args: string[];
  projectRef?: string;
}

interface CommandOutput {
  type: 'success' | 'error' | 'info';
  message: string;
}

function parseCommand(input: string): ParsedCommand | null {
  if (!input.startsWith('/')) return null;
  
  // Parse /command "content" @project format
  const match = input.match(/^\/(\w+)\s*(?:"([^"]+)")?\s*(?:@([\w-]+))?$/);
  if (!match) {
    // Try without quotes for simple commands
    const simpleMatch = input.match(/^\/(\w+)(?:\s+(.+?))?(?:\s+@([\w-]+))?$/);
    if (!simpleMatch) return null;
    return {
      command: simpleMatch[1].toLowerCase(),
      args: simpleMatch[2] ? [simpleMatch[2]] : [],
      projectRef: simpleMatch[3],
    };
  }
  
  return {
    command: match[1].toLowerCase(),
    args: match[2] ? [match[2]] : [],
    projectRef: match[3],
  };
}

export function CommandBar({ open, onOpenChange }: CommandBarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [output, setOutput] = useState<CommandOutput | null>(null);
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const { projects } = useProjects();
  const { notes, createNote } = useNotes();
  const { bookmarks, createBookmark } = useBookmarks();
  const { tasks, createTask } = useTasks();

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setSearch('');
      setOutput(null);
      setStreamedText('');
      setIsStreaming(false);
    }
  }, [open]);

  // Stream output effect
  const streamOutput = useCallback(async (text: string, type: CommandOutput['type']) => {
    setIsStreaming(true);
    setStreamedText('');
    setOutput({ type, message: '' });
    
    for (let i = 0; i < text.length; i++) {
      await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
      setStreamedText(prev => prev + text[i]);
    }
    
    setOutput({ type, message: text });
    setIsStreaming(false);
  }, []);

  // Execute command
  const executeCommand = useCallback(async (parsed: ParsedCommand) => {
    const { command, args, projectRef } = parsed;

    // Find project by name if referenced
    let targetProject = projectRef 
      ? projects.find(p => 
          p.name.toLowerCase().replace(/\s+/g, '-') === projectRef.toLowerCase() ||
          p.name.toLowerCase().includes(projectRef.toLowerCase())
        )
      : projects[0]; // Default to first project

    switch (command) {
      case 'note': {
        if (!args[0]) {
          await streamOutput('ERROR: Note title required. Usage: /note "My Note Title"', 'error');
          return;
        }
        const newNote = createNote({
          title: args[0],
          content: '',
          projectIds: targetProject ? [targetProject.id] : [],
          linkedNoteIds: [],
        });
        await streamOutput(`[OK] Note created: "${args[0]}"${targetProject ? ` → ${targetProject.name}` : ''}`, 'success');
        setTimeout(() => {
          onOpenChange(false);
          navigate(`/notes/${newNote.id}`);
        }, 800);
        break;
      }

      case 'task': {
        if (!args[0]) {
          await streamOutput('ERROR: Task title required. Usage: /task "My Task" @project-name', 'error');
          return;
        }
        if (!targetProject) {
          await streamOutput('ERROR: No project found. Create a project first or specify @project-name', 'error');
          return;
        }
        createTask({
          title: args[0],
          description: '',
          projectId: targetProject.id,
          status: 'backlog',
          priority: 'medium',
        });
        await streamOutput(`[OK] Task added: "${args[0]}" → ${targetProject.name}`, 'success');
        break;
      }

      case 'bookmark': {
        const url = args[0];
        if (!url) {
          await streamOutput('ERROR: URL required. Usage: /bookmark https://example.com', 'error');
          return;
        }
        // Simple URL validation
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          await streamOutput('ERROR: Invalid URL. Must start with http:// or https://', 'error');
          return;
        }
        const domain = new URL(url).hostname;
        createBookmark({
          title: domain,
          url: url,
          description: '',
          projectIds: targetProject ? [targetProject.id] : [],
        });
        await streamOutput(`[OK] Bookmark saved: ${domain}${targetProject ? ` → ${targetProject.name}` : ''}`, 'success');
        break;
      }

      case 'log': {
        const message = args[0];
        if (!message) {
          await streamOutput('ERROR: Message required. Usage: /log "Your activity message"', 'error');
          return;
        }
        addActivity({
          type: 'note_updated',
          entityId: generateId(),
          entityType: 'note',
          title: message,
        });
        await streamOutput(`[LOGGED] ${message}`, 'success');
        break;
      }

      case 'status': {
        const stats = [
          `SYSTEM STATUS`,
          `─────────────────`,
          `Projects: ${projects.length} (${projects.filter(p => p.status === 'active').length} active)`,
          `Notes: ${notes.length}`,
          `Bookmarks: ${bookmarks.length}`,
          `Tasks: ${tasks.length} (${tasks.filter(t => t.status === 'done').length} complete)`,
          `─────────────────`,
          `SYSTEM OPERATIONAL`,
        ].join('\n');
        await streamOutput(stats, 'info');
        break;
      }

      case 'focus': {
        const projectName = args[0];
        if (!projectName) {
          await streamOutput('ERROR: Project name required. Usage: /focus project-name', 'error');
          return;
        }
        const project = projects.find(p => 
          p.name.toLowerCase().includes(projectName.toLowerCase())
        );
        if (!project) {
          await streamOutput(`ERROR: Project "${projectName}" not found`, 'error');
          return;
        }
        await streamOutput(`[FOCUSING] Neural link to: ${project.name}`, 'success');
        setTimeout(() => {
          onOpenChange(false);
          navigate(`/graph?focus=${project.id}`);
        }, 600);
        break;
      }

      case 'help': {
        const help = [
          `TERMINAL COMMANDS`,
          `─────────────────────────────────`,
          `/note "title"        Create a new note`,
          `/task "title" @proj  Create task in project`,
          `/bookmark url        Save a bookmark`,
          `/log "message"       Log an activity`,
          `/status              Show system stats`,
          `/focus project       Focus graph on project`,
          `/help                Show this help`,
          `─────────────────────────────────`,
          `Tip: Use @project-name to link items`,
        ].join('\n');
        await streamOutput(help, 'info');
        break;
      }

      default:
        await streamOutput(`ERROR: Unknown command "/${command}". Type /help for available commands.`, 'error');
    }
  }, [projects, notes, bookmarks, tasks, navigate, onOpenChange, streamOutput, createNote, createBookmark, createTask]);

  // Detect and handle commands
  const isCommand = search.startsWith('/');
  const parsedCommand = isCommand ? parseCommand(search) : null;

  // Handle enter key for commands
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isCommand && parsedCommand && !isStreaming) {
        e.preventDefault();
        executeCommand(parsedCommand);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isCommand, parsedCommand, isStreaming, executeCommand]);

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim() || isCommand) return { projects: [], notes: [], bookmarks: [], tasks: [] };
    
    const query = search.toLowerCase();
    
    return {
      projects: projects.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      ).slice(0, 3),
      notes: notes.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      ).slice(0, 3),
      bookmarks: bookmarks.filter(b => 
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        (b.description?.toLowerCase().includes(query) ?? false)
      ).slice(0, 3),
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes(query) ||
        (t.description?.toLowerCase().includes(query) ?? false)
      ).slice(0, 3),
    };
  }, [search, projects, notes, bookmarks, tasks, isCommand]);

  const hasSearchResults = search.trim() && !isCommand && (
    searchResults.projects.length > 0 ||
    searchResults.notes.length > 0 ||
    searchResults.bookmarks.length > 0 ||
    searchResults.tasks.length > 0
  );

  const runCommand = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search or type / for commands..." 
        className={cn(
          "font-mono",
          isCommand && "text-terminal-green"
        )}
        value={search}
        onValueChange={setSearch}
      />
      
      {/* Command Output Area */}
      {(output || isStreaming) && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <pre className={cn(
            "font-mono text-xs whitespace-pre-wrap",
            output?.type === 'success' && "cmd-success",
            output?.type === 'error' && "cmd-error",
            output?.type === 'info' && "cmd-info",
          )}>
            {isStreaming ? streamedText : output?.message}
            {isStreaming && <span className="animate-pulse">▋</span>}
          </pre>
        </div>
      )}

      <CommandList className="max-h-[400px]">
        {/* Command Mode Hints */}
        {isCommand && !output && (
          <CommandGroup heading="Terminal Commands" className="font-mono">
            <CommandItem 
              onSelect={() => setSearch('/note "')}
              className="gap-3"
            >
              <FileText className="h-4 w-4 text-glow-secondary" />
              <span>/note "title"</span>
              <span className="ml-auto text-xs text-muted-foreground">Create note</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => setSearch('/task "')}
              className="gap-3"
            >
              <CheckSquare className="h-4 w-4 text-primary" />
              <span>/task "title" @project</span>
              <span className="ml-auto text-xs text-muted-foreground">Create task</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => setSearch('/bookmark ')}
              className="gap-3"
            >
              <Bookmark className="h-4 w-4 text-terminal-green" />
              <span>/bookmark url</span>
              <span className="ml-auto text-xs text-muted-foreground">Save bookmark</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => setSearch('/log "')}
              className="gap-3"
            >
              <Activity className="h-4 w-4 text-warning" />
              <span>/log "message"</span>
              <span className="ml-auto text-xs text-muted-foreground">Log activity</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => { setSearch('/status'); setTimeout(() => executeCommand({ command: 'status', args: [] }), 100); }}
              className="gap-3"
            >
              <Terminal className="h-4 w-4 text-primary" />
              <span>/status</span>
              <span className="ml-auto text-xs text-muted-foreground">System stats</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => setSearch('/focus ')}
              className="gap-3"
            >
              <Network className="h-4 w-4 text-glow-secondary" />
              <span>/focus project-name</span>
              <span className="ml-auto text-xs text-muted-foreground">Focus graph</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => { setSearch('/help'); setTimeout(() => executeCommand({ command: 'help', args: [] }), 100); }}
              className="gap-3"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span>/help</span>
              <span className="ml-auto text-xs text-muted-foreground">Show all commands</span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandEmpty className="py-6 text-center text-muted-foreground font-mono">
          {isCommand ? 'Press Enter to execute command' : 'No results found.'}
        </CommandEmpty>
        
        {/* Search Results */}
        {hasSearchResults && (
          <>
            {searchResults.projects.length > 0 && (
              <CommandGroup heading="Projects" className="font-mono">
                {searchResults.projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => runCommand(() => navigate(`/projects/${project.id}`))}
                    className="gap-3"
                  >
                    <div className="w-3 h-3" style={{ backgroundColor: project.color }} />
                    <span>{project.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
                      {project.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.notes.length > 0 && (
              <CommandGroup heading="Notes" className="font-mono">
                {searchResults.notes.map((note) => (
                  <CommandItem
                    key={note.id}
                    onSelect={() => runCommand(() => navigate(`/notes/${note.id}`))}
                    className="gap-3"
                  >
                    <FileText className="h-4 w-4 text-glow-secondary" />
                    <span>{note.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
                      {note.content.substring(0, 50)}...
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.bookmarks.length > 0 && (
              <CommandGroup heading="Bookmarks" className="font-mono">
                {searchResults.bookmarks.map((bookmark) => (
                  <CommandItem
                    key={bookmark.id}
                    onSelect={() => runCommand(() => window.open(bookmark.url, '_blank'))}
                    className="gap-3"
                  >
                    <Bookmark className="h-4 w-4 text-terminal-green" />
                    <span>{bookmark.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
                      {bookmark.url}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.tasks.length > 0 && (
              <CommandGroup heading="Tasks" className="font-mono">
                {searchResults.tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    onSelect={() => runCommand(() => navigate('/tasks'))}
                    className="gap-3"
                  >
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>{task.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {task.status}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
          </>
        )}

        {/* Navigation */}
        {!search.trim() && (
          <>
            <CommandGroup heading="Navigation" className="font-mono">
              <CommandItem
                onSelect={() => runCommand(() => navigate('/'))}
                className="gap-3"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>Dashboard</span>
                <span className="ml-auto text-xs text-muted-foreground">Mission Control</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/projects'))}
                className="gap-3"
              >
                <FolderKanban className="h-4 w-4 text-primary" />
                <span>Projects</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/notes'))}
                className="gap-3"
              >
                <FileText className="h-4 w-4 text-primary" />
                <span>Notes</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/bookmarks'))}
                className="gap-3"
              >
                <Bookmark className="h-4 w-4 text-primary" />
                <span>Bookmarks</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/tasks'))}
                className="gap-3"
              >
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>Tasks</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/graph'))}
                className="gap-3"
              >
                <Network className="h-4 w-4 text-primary" />
                <span>Connection Graph</span>
                <span className="ml-auto text-xs text-muted-foreground">The Big Picture</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/settings'))}
                className="gap-3"
              >
                <Settings className="h-4 w-4 text-primary" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Actions" className="font-mono">
              <CommandItem
                onSelect={() => runCommand(() => navigate('/projects/new'))}
                className="gap-3"
              >
                <Plus className="h-4 w-4 text-terminal-green" />
                <span>New Project</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/notes/new'))}
                className="gap-3"
              >
                <Plus className="h-4 w-4 text-terminal-green" />
                <span>New Note</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/bookmarks/new'))}
                className="gap-3"
              >
                <Plus className="h-4 w-4 text-terminal-green" />
                <span>Add Bookmark</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Terminal" className="font-mono">
              <CommandItem
                onSelect={() => setSearch('/')}
                className="gap-3"
              >
                <Terminal className="h-4 w-4 text-terminal-green" />
                <span>Enter Command Mode</span>
                <span className="ml-auto text-xs text-muted-foreground">Type / to start</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
      
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground font-mono flex items-center gap-4">
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>esc Close</span>
        {isCommand && <span className="text-terminal-green ml-auto">COMMAND MODE</span>}
      </div>
    </CommandDialog>
  );
}

// Hook for command bar keyboard shortcut
export function useCommandBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}
