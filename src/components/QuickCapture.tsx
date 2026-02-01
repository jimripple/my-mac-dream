import { useState } from 'react';
import { useProjects, useNotes, useBookmarks, useTasks } from '@/hooks/useStore';
import { 
  Plus, 
  FileText, 
  Bookmark, 
  CheckSquare, 
  ChevronDown,
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type CaptureType = 'note' | 'bookmark' | 'task' | null;

export function QuickCapture() {
  const { projects } = useProjects();
  const { createNote } = useNotes();
  const { createBookmark } = useBookmarks();
  const { createTask } = useTasks();
  const { toast } = useToast();

  const [activeType, setActiveType] = useState<CaptureType>(null);
  
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
    setActiveType(null);
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

  const getDomainFromUrl = (urlString: string) => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  const captureOptions = [
    { type: 'note' as const, icon: FileText, label: 'Quick Note', color: 'text-glow-secondary' },
    { type: 'bookmark' as const, icon: Bookmark, label: 'Add Bookmark', color: 'text-terminal-green' },
    { type: 'task' as const, icon: CheckSquare, label: 'New Task', color: 'text-primary' },
  ];

  return (
    <div className="bg-card p-6 relative corner-brackets">
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
      
      <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-terminal-green" />
        <span className="uppercase tracking-wider">Quick_Capture</span>
      </h2>

      {/* Capture Type Selection */}
      {!activeType && (
        <div className="grid grid-cols-3 gap-4">
          {captureOptions.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className="flex items-center gap-3 p-4 bg-surface border border-border hover:border-primary/50 transition-all group"
            >
              <Icon className={cn("h-5 w-5 transition-colors", color)} />
              <span className="font-mono text-sm group-hover:text-primary transition-colors">
                {label}
              </span>
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors rotate-[-90deg]" />
            </button>
          ))}
        </div>
      )}

      {/* Quick Note Form */}
      {activeType === 'note' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-glow-secondary" />
            <span className="font-mono text-sm font-bold">Quick Note</span>
          </div>
          
          <Input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title..."
            className="font-mono bg-surface border-border"
            autoFocus
          />
          
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write something..."
            className="font-mono bg-surface border-border min-h-[100px] resize-none"
          />
          
          {projects.length > 0 && (
            <Select value={noteProject} onValueChange={setNoteProject}>
              <SelectTrigger className="font-mono bg-surface border-border">
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
            <Button variant="outline" size="sm" onClick={resetForms} className="font-mono">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveNote}
              disabled={!noteTitle.trim() && !noteContent.trim()}
              className="font-mono"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Bookmark Form */}
      {activeType === 'bookmark' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="h-5 w-5 text-terminal-green" />
            <span className="font-mono text-sm font-bold">Add Bookmark</span>
          </div>
          
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={bookmarkUrl}
              onChange={(e) => setBookmarkUrl(e.target.value)}
              placeholder="https://example.com"
              className="font-mono bg-surface border-border pl-10"
              autoFocus
            />
          </div>
          
          <Input
            value={bookmarkTitle}
            onChange={(e) => setBookmarkTitle(e.target.value)}
            placeholder="Title (optional)"
            className="font-mono bg-surface border-border"
          />
          
          {projects.length > 0 && (
            <Select value={bookmarkProject} onValueChange={setBookmarkProject}>
              <SelectTrigger className="font-mono bg-surface border-border">
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
            <Button variant="outline" size="sm" onClick={resetForms} className="font-mono">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveBookmark}
              disabled={!bookmarkUrl.trim()}
              className="font-mono"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Bookmark
            </Button>
          </div>
        </div>
      )}

      {/* Task Form */}
      {activeType === 'task' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm font-bold">New Task</span>
          </div>
          
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="font-mono bg-surface border-border"
            autoFocus
          />
          
          <Select value={taskProject} onValueChange={setTaskProject}>
            <SelectTrigger className="font-mono bg-surface border-border">
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
            <SelectTrigger className="font-mono bg-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetForms} className="font-mono">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveTask}
              disabled={!taskTitle.trim() || !taskProject}
              className="font-mono"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
