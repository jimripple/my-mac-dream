import { useState } from 'react';
import { useProjects, useNotes, useBookmarks, useTasks } from '@/hooks/useStore';
import { 
  Plus, 
  FileText, 
  Bookmark, 
  CheckSquare, 
  Save,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function QuickCaptureBar({ className }: { className?: string }) {
  const { projects } = useProjects();
  const { createNote } = useNotes();
  const { createBookmark } = useBookmarks();
  const { createTask } = useTasks();
  const { toast } = useToast();

  // Track which popover is open
  const [openPopover, setOpenPopover] = useState<'note' | 'bookmark' | 'task' | null>(null);
  
  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteProject, setNoteProject] = useState('');

  // Bookmark state
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkProject, setBookmarkProject] = useState('');

  // Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const resetForms = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteProject('');
    setBookmarkUrl('');
    setBookmarkTitle('');
    setBookmarkProject('');
    setTaskTitle('');
    setTaskProject('');
    setTaskPriority('medium');
    setOpenPopover(null);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    
    createNote({
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
      projectIds: noteProject ? [noteProject] : [],
      linkedNoteIds: [],
    });
    
    toast({
      title: "Note created",
      description: noteTitle.trim() || 'Untitled Note',
    });
    
    resetForms();
  };

  const handleSaveBookmark = () => {
    if (!bookmarkUrl.trim()) return;
    
    let url = bookmarkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const getDomainFromUrl = (urlString: string) => {
      try {
        return new URL(urlString).hostname.replace('www.', '');
      } catch {
        return urlString;
      }
    };
    
    createBookmark({
      title: bookmarkTitle.trim() || getDomainFromUrl(url),
      url,
      projectIds: bookmarkProject ? [bookmarkProject] : [],
    });
    
    toast({
      title: "Bookmark saved",
      description: bookmarkTitle.trim() || url,
    });
    
    resetForms();
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim() || !taskProject) return;
    
    createTask({
      title: taskTitle.trim(),
      projectId: taskProject,
      status: 'backlog',
      priority: taskPriority,
    });
    
    toast({
      title: "Task created",
      description: taskTitle.trim(),
    });
    
    resetForms();
  };

  return (
    <div className={cn(
      "h-12 bg-card border border-border flex items-center gap-3 px-4 relative corner-brackets",
      className
    )}>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
      
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
        Quick_Capture:
      </span>

      {/* Note Popover */}
      <Popover open={openPopover === 'note'} onOpenChange={(open) => setOpenPopover(open ? 'note' : null)}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 font-mono text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5 text-glow-secondary" />
            Note
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-80 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-glow-secondary" />
              <span className="font-mono text-sm font-bold">Quick Note</span>
            </div>
            
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="font-mono text-sm bg-surface border-border h-8"
              autoFocus
            />
            
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write something..."
              className="font-mono text-sm bg-surface border-border min-h-[80px] resize-none"
            />
            
            {projects.length > 0 && (
              <Select value={noteProject} onValueChange={setNoteProject}>
                <SelectTrigger className="font-mono text-sm bg-surface border-border h-8">
                  <SelectValue placeholder="Link to project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetForms} className="font-mono text-xs h-7">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveNote}
                disabled={!noteTitle.trim() && !noteContent.trim()}
                className="font-mono text-xs h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Bookmark Popover */}
      <Popover open={openPopover === 'bookmark'} onOpenChange={(open) => setOpenPopover(open ? 'bookmark' : null)}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 font-mono text-xs gap-1.5">
            <Bookmark className="h-3.5 w-3.5 text-terminal-green" />
            Bookmark
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" className="w-80 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-terminal-green" />
              <span className="font-mono text-sm font-bold">Add Bookmark</span>
            </div>
            
            <div className="relative">
              <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
                placeholder="https://example.com"
                className="font-mono text-sm bg-surface border-border pl-8 h-8"
                autoFocus
              />
            </div>
            
            <Input
              value={bookmarkTitle}
              onChange={(e) => setBookmarkTitle(e.target.value)}
              placeholder="Title (optional)"
              className="font-mono text-sm bg-surface border-border h-8"
            />
            
            {projects.length > 0 && (
              <Select value={bookmarkProject} onValueChange={setBookmarkProject}>
                <SelectTrigger className="font-mono text-sm bg-surface border-border h-8">
                  <SelectValue placeholder="Link to project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetForms} className="font-mono text-xs h-7">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveBookmark}
                disabled={!bookmarkUrl.trim()}
                className="font-mono text-xs h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Task Popover */}
      <Popover open={openPopover === 'task'} onOpenChange={(open) => setOpenPopover(open ? 'task' : null)}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 font-mono text-xs gap-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-primary" />
            Task
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-bold">New Task</span>
            </div>
            
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="font-mono text-sm bg-surface border-border h-8"
              autoFocus
            />
            
            <Select value={taskProject} onValueChange={setTaskProject}>
              <SelectTrigger className="font-mono text-sm bg-surface border-border h-8">
                <SelectValue placeholder="Select project (required)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2" style={{ backgroundColor: project.color }} />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={taskPriority} onValueChange={(v: any) => setTaskPriority(v)}>
              <SelectTrigger className="font-mono text-sm bg-surface border-border h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetForms} className="font-mono text-xs h-7">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveTask}
                disabled={!taskTitle.trim() || !taskProject}
                className="font-mono text-xs h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Keyboard shortcut hint */}
      <div className="ml-auto text-[10px] font-mono text-muted-foreground/50 hidden lg:block">
        ⌘K for Command Bar
      </div>
    </div>
  );
}
