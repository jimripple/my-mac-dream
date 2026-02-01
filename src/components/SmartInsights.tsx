import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useNotes, useBookmarks, useTasks, useActivities } from '@/hooks/useStore';
import { generateInsights, Insight } from '@/lib/insightsEngine';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Zap,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SmartInsights() {
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();
  const { activities } = useActivities();

  const insights = useMemo(() => 
    generateInsights({ projects, notes, bookmarks, tasks, activities }),
    [projects, notes, bookmarks, tasks, activities]
  );

  if (insights.length === 0) {
    return (
      <div className="bg-card border border-border p-6 relative corner-brackets">
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
        
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold font-display uppercase tracking-wider">
            Smart_Insights
          </h2>
        </div>
        
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">
            All systems nominal. No actionable insights right now.
          </p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-1">
            Add tasks with due dates to get predictions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 relative corner-brackets">
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold font-display uppercase tracking-wider">
            Smart_Insights
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {insights.length} ACTION{insights.length > 1 ? 'S' : ''} RECOMMENDED
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const Icon = getInsightIcon(insight.type);
  
  return (
    <div className={cn(
      "p-4 border transition-all group",
      insight.priority === 'high' && "border-destructive/50 bg-destructive/5",
      insight.priority === 'medium' && "border-warning/50 bg-warning/5",
      insight.priority === 'low' && "border-border bg-surface hover:border-primary/30",
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 flex-shrink-0",
          insight.priority === 'high' && "bg-destructive/20 text-destructive",
          insight.priority === 'medium' && "bg-warning/20 text-warning",
          insight.priority === 'low' && "bg-primary/10 text-primary",
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-mono font-bold text-sm",
              insight.priority === 'high' && "text-destructive",
              insight.priority === 'medium' && "text-warning",
            )}>
              {insight.title}
            </h3>
            {insight.priority === 'high' && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-destructive text-destructive-foreground animate-pulse">
                URGENT
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono leading-relaxed">
            {insight.description}
          </p>
        </div>

        {insight.action && (
          <Link
            to={insight.action.path || '#'}
            className={cn(
              "flex items-center gap-1 text-xs font-mono px-3 py-1.5 transition-colors flex-shrink-0",
              insight.priority === 'high' && "bg-destructive/20 text-destructive hover:bg-destructive/30",
              insight.priority === 'medium' && "bg-warning/20 text-warning hover:bg-warning/30",
              insight.priority === 'low' && "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            {insight.action.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function getInsightIcon(type: Insight['type']) {
  switch (type) {
    case 'warning':
      return AlertTriangle;
    case 'suggestion':
      return Lightbulb;
    case 'prediction':
      return TrendingUp;
    case 'nudge':
      return Zap;
    default:
      return Lightbulb;
  }
}
