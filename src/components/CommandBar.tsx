import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useNotes, useBookmarks, useTasks } from '@/hooks/useStore';
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
} from 'lucide-react';

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandBar({ open, onOpenChange }: CommandBarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();

  // Reset search when closed
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return { projects: [], notes: [], bookmarks: [], tasks: [] };
    
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
  }, [search, projects, notes, bookmarks, tasks]);

  const hasSearchResults = search.trim() && (
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
        placeholder="Search or type a command..." 
        className="font-mono"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty className="py-6 text-center text-muted-foreground font-mono">
          No results found.
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
          </>
        )}
      </CommandList>
      
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground font-mono flex items-center gap-4">
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>esc Close</span>
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
