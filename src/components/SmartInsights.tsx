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
import { ScrollArea } from '@/components/ui/scroll-area';

interface SmartInsightsProps {
  compact?: boolean;
  className?: string;
}

export function SmartInsights({ compact = false, className }: SmartInsightsProps) {
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();
  const { activities } = useActivities();

  const insights = useMemo(() => 
    generateInsights({ projects, notes, bookmarks, tasks, activities }),
    [projects, notes, bookmarks, tasks, activities]
  );

  // In compact mode, limit visible insights
  const displayInsights = compact ? insights.slice(0, 3) : insights;

  if (insights.length === 0) {
    return (
      <div className={cn(
        "bg-card border border-border relative corner-brackets",
        compact ? "p-3" : "p-6",
        className
      )}>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
        
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className={cn("text-primary", compact ? "h-4 w-4" : "h-5 w-5")} />
          <h2 className={cn(
            "font-bold font-display uppercase tracking-wider",
            compact ? "text-sm" : "text-lg"
          )}>
            Smart_Insights
          </h2>
        </div>
        
        <div className={cn("text-center", compact ? "py-4" : "py-8")}>
          <Lightbulb className={cn(
            "text-muted-foreground/20 mx-auto mb-2",
            compact ? "h-8 w-8" : "h-12 w-12"
          )} />
          <p className={cn(
            "text-muted-foreground font-mono",
            compact ? "text-[10px]" : "text-sm"
          )}>
            All systems nominal.
          </p>
        </div>
      </div>
    );
  }

  const containerClasses = cn(
    "bg-card border border-border relative corner-brackets flex flex-col",
    compact ? "p-3 max-h-[180px]" : "p-6",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
      
      <div className={cn(
        "flex items-center justify-between flex-shrink-0",
        compact ? "mb-2" : "mb-4"
      )}>
        <div className="flex items-center gap-2">
          <BrainCircuit className={cn("text-primary", compact ? "h-4 w-4" : "h-5 w-5")} />
          <h2 className={cn(
            "font-bold font-display uppercase tracking-wider",
            compact ? "text-sm" : "text-lg"
          )}>
            Smart_Insights
          </h2>
        </div>
        <span className={cn(
          "font-mono text-muted-foreground",
          compact ? "text-[10px]" : "text-xs"
        )}>
          {insights.length} ACTION{insights.length > 1 ? 'S' : ''}
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className={cn("space-y-2", compact ? "pr-2" : "space-y-3")}>
          {displayInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} compact={compact} />
          ))}
          {compact && insights.length > 3 && (
            <p className="text-[10px] font-mono text-muted-foreground text-center py-1">
              +{insights.length - 3} more insights
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function InsightCard({ insight, compact = false }: { insight: Insight; compact?: boolean }) {
  const Icon = getInsightIcon(insight.type);
  
  return (
    <div className={cn(
      "border transition-all group",
      compact ? "p-2" : "p-4",
      insight.priority === 'high' && "border-destructive/50 bg-destructive/5",
      insight.priority === 'medium' && "border-warning/50 bg-warning/5",
      insight.priority === 'low' && "border-border bg-surface hover:border-primary/30",
    )}>
      <div className="flex items-start gap-2">
        <div className={cn(
          "flex-shrink-0",
          compact ? "p-1" : "p-2",
          insight.priority === 'high' && "bg-destructive/20 text-destructive",
          insight.priority === 'medium' && "bg-warning/20 text-warning",
          insight.priority === 'low' && "bg-primary/10 text-primary",
        )}>
          <Icon className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className={cn(
              "font-mono font-bold truncate",
              compact ? "text-[11px]" : "text-sm",
              insight.priority === 'high' && "text-destructive",
              insight.priority === 'medium' && "text-warning",
            )}>
              {insight.title}
            </h3>
            {insight.priority === 'high' && !compact && (
              <span className="text-[10px] font-mono px-1 py-0.5 bg-destructive text-destructive-foreground animate-pulse">
                URGENT
              </span>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2">
              {insight.description}
            </p>
          )}
        </div>

        {insight.action && (
          <Link
            to={insight.action.path || '#'}
            className={cn(
              "flex items-center gap-1 font-mono transition-colors flex-shrink-0",
              compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-3 py-1.5",
              insight.priority === 'high' && "bg-destructive/20 text-destructive hover:bg-destructive/30",
              insight.priority === 'medium' && "bg-warning/20 text-warning hover:bg-warning/30",
              insight.priority === 'low' && "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            {compact ? 'Go' : insight.action.label}
            <ArrowRight className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
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
