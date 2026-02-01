import { useSearchParams } from 'react-router-dom';
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
import { QuickCaptureBar } from '@/components/QuickCaptureBar';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { SmartInsights } from '@/components/SmartInsights';
import { ExpandablePanel } from '@/components/ExpandablePanel';
import { FocusedPanelView } from '@/components/FocusedPanelView';
import { ScrollArea } from '@/components/ui/scroll-area';

type PanelType = 'insights' | 'heatmap' | 'activity' | 'projects';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedPanel = searchParams.get('focus') as PanelType | null;
  
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { activities } = useActivities();
  const stats = useStats();

  const expandPanel = (panel: PanelType) => {
    setSearchParams({ focus: panel });
  };

  const collapsePanels = () => {
    setSearchParams({});
  };

  // If a panel is focused, render only that panel in full view
  if (focusedPanel) {
    return <FocusedPanelView panel={focusedPanel} onBack={collapsePanels} />;
  }

  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 6);
  const recentActivities = activities.slice(0, 5);

  // Calculate progress for each project based on its tasks
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header - fixed height */}
      <header className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
          <span className="text-primary animate-pulse-glow">●</span>
          <span>SYSTEM ONLINE</span>
          <span className="mx-2">|</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <h1 className="text-2xl font-bold font-display">
          <span className="text-primary glow-text">Mission</span> Control
        </h1>
      </header>

      {/* Stats Grid - compact */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 mb-4">
        <StatCard 
          icon={FolderKanban} 
          label="Projects" 
          value={stats.activeProjects} 
          total={stats.projectCount}
        />
        <StatCard 
          icon={CheckSquare} 
          label="Tasks" 
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

      {/* Main content - fills remaining space */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Left column - 60% */}
        <div className="flex-[6] flex flex-col gap-4 overflow-hidden">
          {/* Active Projects - Expandable */}
          <ExpandablePanel 
            onClick={() => expandPanel('projects')}
            className="flex-1"
          >
            <div className="h-full bg-card border border-border p-4 relative corner-brackets overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
              
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h2 className="text-sm font-bold font-display flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="uppercase tracking-wider">Active_Projects</span>
                </h2>
                <Link 
                  to="/projects" 
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
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
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-2 gap-3 pr-2">
                    {activeProjects.map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        progress={getProjectProgress(project.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </ExpandablePanel>
        </div>

        {/* Right column - 40% */}
        <div className="flex-[4] flex flex-col gap-4 overflow-hidden">
          {/* Smart Insights - Expandable */}
          <ExpandablePanel 
            onClick={() => expandPanel('insights')}
            className="flex-shrink-0"
          >
            <SmartInsights compact />
          </ExpandablePanel>
          
          {/* Activity Heatmap - Expandable */}
          <ExpandablePanel 
            onClick={() => expandPanel('heatmap')}
            className="flex-shrink-0"
          >
            <ActivityHeatmap compact />
          </ExpandablePanel>
          
          {/* Activity Log - Expandable */}
          <ExpandablePanel 
            onClick={() => expandPanel('activity')}
            className="flex-1"
          >
            <div className="h-full bg-card border border-border p-4 relative corner-brackets overflow-hidden flex flex-col min-h-0">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
              
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h2 className="text-sm font-bold font-display flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="uppercase tracking-wider">Activity_Log</span>
                </h2>
              </div>

              {recentActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground font-mono text-center py-4">
                  No activity yet
                </p>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-2">
                    {recentActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </ExpandablePanel>
        </div>
      </div>

      {/* Footer - Quick Capture bar */}
      <QuickCaptureBar className="flex-shrink-0 mt-4" />
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
    <div className="bg-card border border-border p-3 relative overflow-hidden group hover:bg-card/80 transition-colors corner-brackets">
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-xl font-bold font-display">
            <span className="text-primary glow-text">{value}</span>
            {total !== undefined && (
              <span className="text-muted-foreground text-sm">/{total}</span>
            )}
          </p>
        </div>
        <Icon className="h-6 w-6 text-muted-foreground/20 group-hover:text-primary/30 transition-colors" />
      </div>
      
      {showProgress && progress !== undefined && (
        <div className="mt-2">
          <div className="h-0.5 bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 progress-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
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
      className="block p-3 bg-surface border border-border hover:border-primary/50 transition-all group"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2">
        <div 
          className="w-2 h-2 mt-1.5 flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold font-mono text-xs truncate group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
            {project.description}
          </p>
          
          {/* Compact Progress */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
              {progress}%
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
    <div className="flex items-start gap-2 text-xs group">
      <Icon className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-foreground truncate font-mono text-[11px]">
          {activity.title}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
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
    <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
      <p className="text-muted-foreground font-mono text-xs mb-3">{message}</p>
      {action && (
        <Link
          to={action.path}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="h-3 w-3" />
          {action.label}
        </Link>
      )}
    </div>
  );
}
