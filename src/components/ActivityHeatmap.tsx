import { useMemo, useState } from 'react';
import { useActivities } from '@/hooks/useStore';
import { 
  generateHeatmapData, 
  calculateHeatmapStats, 
  formatHour, 
  getDayLabel,
  HeatmapCell 
} from '@/lib/activityAnalytics';
import { Activity, Zap, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActivityHeatmapProps {
  compact?: boolean;
}

export function ActivityHeatmap({ compact = false }: ActivityHeatmapProps) {
  const { activities } = useActivities();
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  
  const heatmapData = useMemo(() => generateHeatmapData(activities), [activities]);
  const stats = useMemo(() => calculateHeatmapStats(activities), [activities]);
  
  // Group by day for row rendering
  const rows = useMemo(() => {
    const result: HeatmapCell[][] = [];
    for (let day = 0; day < 7; day++) {
      result.push(heatmapData.filter(c => c.day === day));
    }
    return result;
  }, [heatmapData]);

  // Hour labels (show every 6 hours in compact mode)
  const hourLabels = compact ? [0, 6, 12, 18] : [0, 4, 8, 12, 16, 20];

  const cellHeight = compact ? 'h-4' : 'h-6';
  const padding = compact ? 'p-3' : 'p-6';

  return (
    <div className={cn(
      "bg-card border border-border relative corner-brackets flex-shrink-0",
      padding
    )}>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
      
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
        compact ? "mb-2" : "mb-6"
      )}>
        <h2 className={cn(
          "font-bold font-display flex items-center gap-2",
          compact ? "text-sm" : "text-lg"
        )}>
          <Zap className={cn("text-primary", compact ? "h-4 w-4" : "h-5 w-5")} />
          <span className="uppercase tracking-wider">System_Pulse</span>
        </h2>
        {!compact && (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>7-DAY ACTIVITY</span>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        <div className={cn("space-y-0.5", compact && "space-y-[2px]")}>
          {rows.map((row, dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-1">
              {/* Day label */}
              <span className={cn(
                "text-[10px] font-mono text-muted-foreground text-right pr-1",
                compact ? "w-8" : "w-12"
              )}>
                {compact ? getDayLabel(dayIndex).slice(0, 3) : getDayLabel(dayIndex)}
              </span>
              
              {/* Hour cells */}
              <div className="flex-1 flex gap-[1px]">
                <TooltipProvider delayDuration={100}>
                  {row.map((cell, hourIndex) => (
                    <Tooltip key={hourIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex-1 transition-all duration-200 cursor-pointer relative",
                            "hover:ring-1 hover:ring-primary hover:z-10",
                            cellHeight,
                            cell.intensity === 0 && "bg-muted/30",
                            cell.intensity === 1 && "bg-primary/20",
                            cell.intensity === 2 && "bg-primary/40",
                            cell.intensity === 3 && "bg-primary/60",
                            cell.intensity === 4 && "bg-primary/80 glow",
                          )}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {/* Ping animation for recent activity */}
                          {cell.day === 0 && cell.count > 0 && !compact && (
                            <span className="absolute inset-0 animate-ping bg-primary/30" style={{ animationDuration: '2s' }} />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="font-mono text-xs">
                        <p className="font-bold">{formatHour(cell.hour)}</p>
                        <p className="text-muted-foreground">
                          {cell.count} {cell.count === 1 ? 'action' : 'actions'}
                        </p>
                        {cell.activities.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-border">
                            {cell.activities.slice(0, 3).map((a, i) => (
                              <p key={i} className="text-[10px] truncate max-w-[150px]">
                                • {a.title}
                              </p>
                            ))}
                            {cell.activities.length > 3 && (
                              <p className="text-[10px] text-muted-foreground">
                                +{cell.activities.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>

        {/* Hour labels */}
        {!compact && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-12" />
            <div className="flex-1 flex">
              {hourLabels.map((hour) => (
                <div 
                  key={hour} 
                  className="text-[10px] font-mono text-muted-foreground"
                  style={{ marginLeft: hour === 0 ? 0 : `${((hour - hourLabels[hourLabels.indexOf(hour) - 1]) / 24) * 100}%` }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend and Stats - inline in compact mode */}
      <div className={cn(
        "flex items-center justify-between",
        compact ? "mt-2 pt-2 border-t border-border" : "mt-6 pt-4 border-t border-border"
      )}>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Density:</span>
          <div className="flex gap-[1px]">
            <div className={cn("bg-muted/30", compact ? "w-3 h-3" : "w-4 h-4")} />
            <div className={cn("bg-primary/20", compact ? "w-3 h-3" : "w-4 h-4")} />
            <div className={cn("bg-primary/40", compact ? "w-3 h-3" : "w-4 h-4")} />
            <div className={cn("bg-primary/60", compact ? "w-3 h-3" : "w-4 h-4")} />
            <div className={cn("bg-primary/80", compact ? "w-3 h-3" : "w-4 h-4")} />
          </div>
        </div>

        {/* Stats */}
        <div className={cn(
          "flex items-center font-mono",
          compact ? "gap-3 text-[10px]" : "gap-6 text-xs"
        )}>
          <div className="flex items-center gap-1">
            <Activity className={cn("text-primary", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="text-muted-foreground">TODAY:</span>
            <span className="text-primary font-bold">{stats.todayCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className={cn("text-glow-secondary", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
            <span className="text-muted-foreground">PEAK:</span>
            <span className="text-glow-secondary font-bold">{formatHour(stats.peakHour)}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-warning" />
              <span className="text-muted-foreground">STREAK:</span>
              <span className="text-warning font-bold">{stats.streakDays}d</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
