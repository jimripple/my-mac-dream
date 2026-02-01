import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProjects, useTasks } from '@/hooks/useStore';
import { Plus, FolderKanban, ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Projects() {
  const { projects, createProject } = useProjects();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId).length;
  };

  const statusColors = {
    active: 'text-terminal-green',
    paused: 'text-warning',
    completed: 'text-primary',
    archived: 'text-muted-foreground',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <FolderKanban className="h-4 w-4 text-primary" />
          <span>PROJECTS HUB</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-display">
            <span className="text-primary glow-text">Project</span> Registry
          </h1>
          <Link
            to="/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 font-mono bg-card border-border"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border">
          <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono mb-4">
            {search ? 'No projects match your search' : 'No projects yet'}
          </p>
          {!search && (
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const progress = getProjectProgress(project.id);
            const taskCount = getProjectTaskCount(project.id);
            
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-6 bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-4 h-4 mt-1 flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold font-mono text-lg truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <span className={cn(
                        "text-[10px] font-mono uppercase px-2 py-0.5 bg-surface",
                        statusColors[project.status]
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
                      
                      {/* Task count */}
                      <span className="text-xs font-mono text-muted-foreground">
                        {taskCount} tasks
                      </span>
                      
                      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
