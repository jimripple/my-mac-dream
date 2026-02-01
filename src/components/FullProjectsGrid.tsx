import { Link } from 'react-router-dom';
import { useProjects, useTasks } from '@/hooks/useStore';
import { 
  FolderKanban, 
  Plus,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function FullProjectsGrid() {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  // Calculate progress for each project based on its tasks
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return { 
      completed, 
      total: projectTasks.length, 
      percent: Math.round((completed / projectTasks.length) * 100) 
    };
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  if (projects.length === 0) {
    return (
      <div className="h-full bg-card border border-border p-6 relative corner-brackets flex items-center justify-center">
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
        <div className="text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No projects yet</p>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 transition-colors mt-4"
          >
            <Plus className="h-3 w-3" />
            Create Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border border-border p-6 relative corner-brackets flex flex-col">
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
      
      {/* Header stats */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">
              <span className="text-primary font-bold">{activeProjects.length}</span>
              <span className="text-muted-foreground ml-1">active</span>
            </span>
          </div>
          {archivedProjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {archivedProjects.length} archived
              </span>
            </div>
          )}
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
          New Project
        </Link>
      </div>

      {/* Projects grid */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Active Projects
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {activeProjects.map((project) => {
                  const progress = getProjectProgress(project.id);
                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="p-4 bg-surface border border-border hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-3 h-3 mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold font-mono text-sm truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {project.description || 'No description'}
                          </p>
                          
                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
                                {progress.completed}/{progress.total} tasks
                              </span>
                              <span className={cn(
                                progress.percent === 100 && "text-primary",
                                progress.percent > 0 && progress.percent < 100 && "text-warning",
                                progress.percent === 0 && "text-muted-foreground"
                              )}>
                                {progress.percent}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-500",
                                  progress.percent === 100 ? "bg-primary" : "bg-warning"
                                )}
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Archived Projects */}
          {archivedProjects.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Archived
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {archivedProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="p-4 bg-surface/50 border border-border/50 hover:border-primary/30 transition-all group opacity-60 hover:opacity-100"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-50"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold font-mono text-sm truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
