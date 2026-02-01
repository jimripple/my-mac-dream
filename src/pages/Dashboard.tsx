import { useProjects, useTasks, useActivities, useStats } from '@/hooks/useStore';
import { formatDistanceToNow } from 'date-fns';
import { 
  FolderKanban, 
  FileText, 
  Bookmark, 
  CheckSquare,
  Activity,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { activities } = useActivities();
  const stats = useStats();

  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 4);
  const recentActivities = activities.slice(0, 8);

  // Calculate progress for each project based on its tasks
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <span className="text-primary animate-pulse-glow">●</span>
          <span>SYSTEM ONLINE</span>
          <span className="mx-2">|</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">Mission</span> Control
        </h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={FolderKanban} 
          label="Active Projects" 
          value={stats.activeProjects} 
          total={stats.projectCount}
        />
        <StatCard 
          icon={CheckSquare} 
          label="Tasks Complete" 
          value={stats.completedTasks} 
          total={stats.taskCount}
          showProgress
          progress={stats.taskProgress}
        />
        <StatCard 
          icon={FileText} 
          label="Notes" 
          value={stats.noteCount} 
        />
        <StatCard 
          icon={Bookmark} 
          label="Bookmarks" 
          value={stats.bookmarkCount} 
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="col-span-2 bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Active Projects
            </h2>
            <Link 
              to="/projects" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <EmptyState 
              message="No active projects yet" 
              action={{ label: "Create Project", path: "/projects/new" }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {activeProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  progress={getProjectProgress(project.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </h2>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono text-center py-8">
              No activity yet. Start by creating a project!
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Capture */}
      <div className="mt-6 bg-card border border-border p-6">
        <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-terminal-green" />
          Quick Capture
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <QuickAction 
            icon={FolderKanban} 
            label="New Project" 
            path="/projects/new"
            color="primary"
          />
          <QuickAction 
            icon={FileText} 
            label="New Note" 
            path="/notes/new"
            color="glow-secondary"
          />
          <QuickAction 
            icon={Bookmark} 
            label="Add Bookmark" 
            path="/bookmarks/new"
            color="terminal-green"
          />
        </div>
      </div>
    </div>
  );
}

// Sub-components

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  total, 
  showProgress, 
  progress 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  total?: number;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div className="bg-card border border-border p-4 relative overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold font-display">
            <span className="text-primary">{value}</span>
            {total !== undefined && (
              <span className="text-muted-foreground text-lg">/{total}</span>
            )}
          </p>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
      </div>
      
      {showProgress && progress !== undefined && (
        <div className="mt-3">
          <div className="h-1 bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 progress-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">
            {progress}% complete
          </p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ 
  project, 
  progress 
}: { 
  project: any; 
  progress: number;
}) {
  return (
    <Link 
      to={`/projects/${project.id}`}
      className="block p-4 bg-surface border border-border hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-3 h-3 mt-1 flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold font-mono text-sm truncate group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {project.description}
          </p>
          
          {/* Progress Ring */}
          <div className="flex items-center gap-2 mt-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${progress * 0.88} 88`}
                  strokeLinecap="square"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold">
                {progress}%
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono uppercase">
              Progress
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.entityType) {
      case 'project': return FolderKanban;
      case 'note': return FileText;
      case 'bookmark': return Bookmark;
      case 'task': return CheckSquare;
      default: return Activity;
    }
  };
  
  const Icon = getIcon();
  
  return (
    <div className="flex items-start gap-3 text-sm group">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-foreground truncate font-mono text-xs">
          {activity.title}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ 
  icon: Icon, 
  label, 
  path, 
  color 
}: { 
  icon: any; 
  label: string; 
  path: string;
  color: string;
}) {
  return (
    <Link
      to={path}
      className="flex items-center gap-3 p-4 bg-surface border border-border hover:border-primary/50 transition-all group"
    >
      <Icon className={cn(
        "h-5 w-5 transition-colors",
        color === 'primary' && "text-primary",
        color === 'glow-secondary' && "text-glow-secondary",
        color === 'terminal-green' && "text-terminal-green",
      )} />
      <span className="font-mono text-sm group-hover:text-primary transition-colors">
        {label}
      </span>
      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

function EmptyState({ 
  message, 
  action 
}: { 
  message: string; 
  action?: { label: string; path: string };
}) {
  return (
    <div className="text-center py-12">
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
