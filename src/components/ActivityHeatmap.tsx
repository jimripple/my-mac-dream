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

export function ActivityHeatmap() {
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

  // Hour labels (show every 4 hours)
  const hourLabels = [0, 4, 8, 12, 16, 20];

  return (
    <div className="bg-card border border-border p-6 relative corner-brackets">
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold font-display flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="uppercase tracking-wider">System_Pulse</span>
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>7-DAY ACTIVITY</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {/* Grid background overlay */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        
        <div className="space-y-1">
          {rows.map((row, dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-1">
              {/* Day label */}
              <span className="w-12 text-[10px] font-mono text-muted-foreground text-right pr-2">
                {getDayLabel(dayIndex)}
              </span>
              
              {/* Hour cells */}
              <div className="flex-1 flex gap-[2px]">
                <TooltipProvider delayDuration={100}>
                  {row.map((cell, hourIndex) => (
                    <Tooltip key={hourIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex-1 h-6 transition-all duration-200 cursor-pointer relative",
                            "hover:ring-1 hover:ring-primary hover:z-10",
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
                          {cell.day === 0 && cell.count > 0 && (
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
      </div>

      {/* Legend and Stats */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Density:</span>
          <div className="flex gap-[2px]">
            <div className="w-4 h-4 bg-muted/30" />
            <div className="w-4 h-4 bg-primary/20" />
            <div className="w-4 h-4 bg-primary/40" />
            <div className="w-4 h-4 bg-primary/60" />
            <div className="w-4 h-4 bg-primary/80" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">HIGH</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">TODAY:</span>
            <span className="text-primary font-bold">{stats.todayCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-glow-secondary" />
            <span className="text-muted-foreground">PEAK:</span>
            <span className="text-glow-secondary font-bold">{formatHour(stats.peakHour)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-3 w-3 text-warning" />
            <span className="text-muted-foreground">STREAK:</span>
            <span className="text-warning font-bold">{stats.streakDays}d</span>
          </div>
        </div>
      </div>
    </div>
  );
}
