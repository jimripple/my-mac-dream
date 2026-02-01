import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects, useTasks, useNotes, useBookmarks } from '@/hooks/useStore';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  CheckSquare, 
  FileText, 
  Bookmark,
  Plus,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, removeProject } = useProjects();
  const { tasks, updateTask } = useTasks();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);
  const projectNotes = notes.filter(n => n.projectIds.includes(id || ''));
  const projectBookmarks = bookmarks.filter(b => b.projectIds.includes(id || ''));

  if (!project) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p className="text-muted-foreground font-mono mb-4">Project not found</p>
        <Button onClick={() => navigate('/projects')} variant="outline">
          Back to Projects
        </Button>
      </div>
    );
  }

  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const progress = projectTasks.length > 0 
    ? Math.round((completedTasks / projectTasks.length) * 100) 
    : 0;

  const statusColors = {
    active: 'text-terminal-green bg-terminal-green/10',
    paused: 'text-warning bg-warning/10',
    completed: 'text-primary bg-primary/10',
    archived: 'text-muted-foreground bg-muted/10',
  };

  const handleDelete = () => {
    removeProject(project.id);
    navigate('/projects');
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'done' ? 'backlog' : 'done';
    updateTask({ ...task, status: newStatus });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex items-start gap-6">
          {/* Progress Circle */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={project.color}
                strokeWidth="3"
                strokeDasharray={`${progress * 0.94} 94`}
                strokeLinecap="square"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-mono font-bold">
              {progress}%
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-3xl font-bold font-display">{project.name}</h1>
              <span className={cn(
                "text-xs font-mono uppercase px-2 py-1",
                statusColors[project.status]
              )}>
                {project.status}
              </span>
            </div>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {format(new Date(project.deadline), 'MMM d, yyyy')}
                </span>
              )}
              <span>{projectTasks.length} tasks</span>
              <span>{projectNotes.length} notes</span>
              <span>{projectBookmarks.length} bookmarks</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="font-mono"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="font-mono text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete the project but keep all linked notes, bookmarks, and tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="tasks" className="font-mono gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks ({projectTasks.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="font-mono gap-2">
            <FileText className="h-4 w-4" />
            Notes ({projectNotes.length})
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="font-mono gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks ({projectBookmarks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-end">
            <Link to={`/tasks?project=${id}`}>
              <Button size="sm" className="font-mono">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </Link>
          </div>
          
          {projectTasks.length === 0 ? (
            <EmptyState 
              icon={CheckSquare} 
              message="No tasks yet" 
              action={{ label: "Add Task", path: `/tasks?project=${id}` }}
            />
          ) : (
            <div className="space-y-2">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={cn(
                      "w-5 h-5 border-2 flex items-center justify-center transition-colors",
                      task.status === 'done' 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground hover:border-primary"
                    )}
                  >
                    {task.status === 'done' && (
                      <CheckSquare className="h-3 w-3 text-primary-foreground" />
                    )}
                  </button>
                  <span className={cn(
                    "font-mono flex-1",
                    task.status === 'done' && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                  <span className={cn(
                    "text-xs font-mono px-2 py-0.5",
                    task.priority === 'high' && "text-destructive bg-destructive/10",
                    task.priority === 'medium' && "text-warning bg-warning/10",
                    task.priority === 'low' && "text-muted-foreground bg-muted/10"
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-end">
            <Link to="/notes/new">
              <Button size="sm" className="font-mono">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </Link>
          </div>
          
          {projectNotes.length === 0 ? (
            <EmptyState 
              icon={FileText} 
              message="No notes linked" 
              action={{ label: "Create Note", path: "/notes/new" }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {projectNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="p-4 bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <h3 className="font-mono font-bold mb-2">{note.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-2">
                    {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="space-y-4">
          <div className="flex justify-end">
            <Link to="/bookmarks/new">
              <Button size="sm" className="font-mono">
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
            </Link>
          </div>
          
          {projectBookmarks.length === 0 ? (
            <EmptyState 
              icon={Bookmark} 
              message="No bookmarks linked" 
              action={{ label: "Add Bookmark", path: "/bookmarks/new" }}
            />
          ) : (
            <div className="space-y-2">
              {projectBookmarks.map((bookmark) => (
                <a
                  key={bookmark.id}
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono font-bold truncate">{bookmark.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  message, 
  action 
}: { 
  icon: any; 
  message: string; 
  action?: { label: string; path: string };
}) {
  return (
    <div className="text-center py-12 bg-card border border-border">
      <Icon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground font-mono text-sm mb-4">{message}</p>
      {action && (
        <Link
          to={action.path}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      )}
    </div>
  );
}
