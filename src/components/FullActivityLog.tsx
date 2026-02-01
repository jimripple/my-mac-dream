import { useActivities } from '@/hooks/useStore';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  FolderKanban, 
  FileText, 
  Bookmark, 
  CheckSquare, 
  Activity,
  Calendar,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function FullActivityLog() {
  const { activities } = useActivities();

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case 'project': return FolderKanban;
      case 'note': return FileText;
      case 'bookmark': return Bookmark;
      case 'task': return CheckSquare;
      default: return Activity;
    }
  };

  const getActionFromType = (type: string) => {
    if (type.includes('created')) return 'created';
    if (type.includes('updated')) return 'updated';
    if (type.includes('completed')) return 'completed';
    if (type.includes('added')) return 'added';
    return 'action';
  };

  const getActionColor = (type: string) => {
    if (type.includes('created') || type.includes('added')) return 'text-primary';
    if (type.includes('updated')) return 'text-warning';
    if (type.includes('deleted')) return 'text-destructive';
    if (type.includes('completed')) return 'text-glow-secondary';
    return 'text-muted-foreground';
  };

  if (activities.length === 0) {
    return (
      <div className="h-full bg-card border border-border p-6 relative corner-brackets flex items-center justify-center">
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No activity recorded yet</p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-1">
            Your actions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border border-border p-6 relative corner-brackets flex flex-col">
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
      
      {/* Header stats */}
      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm">
            <span className="text-primary font-bold">{activities.length}</span>
            <span className="text-muted-foreground ml-1">total actions</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">
            {sortedDates.length} days tracked
          </span>
        </div>
      </div>

      {/* Activity list */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase px-2">
                  {format(new Date(date), 'EEEE, MMM d')}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              {/* Day's activities */}
              <div className="space-y-2">
                {groupedActivities[date].map((activity) => {
                  const Icon = getIcon(activity.entityType);
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-surface border border-border hover:border-primary/30 transition-colors group"
                    >
                      <div className="p-1.5 bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] font-mono uppercase", getActionColor(activity.type))}>
                            {getActionFromType(activity.type)}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/50">
                            {activity.entityType}
                          </span>
                        </div>
                        <p className="font-mono text-sm truncate mt-0.5">
                          {activity.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
