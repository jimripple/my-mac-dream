import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Command,
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
  Search,
  Network,
} from 'lucide-react';

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandBar({ open, onOpenChange }: CommandBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const runCommand = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="bg-popover border border-border">
        <CommandInput 
          placeholder="Type a command or search..." 
          className="font-mono"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-6 text-center text-muted-foreground font-mono">
            No results found.
          </CommandEmpty>
          
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
        </CommandList>
        
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground font-mono flex items-center gap-4">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>esc Close</span>
        </div>
      </Command>
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
