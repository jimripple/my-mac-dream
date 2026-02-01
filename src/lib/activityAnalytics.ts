// Activity analytics for heatmap visualization
import { Activity } from '@/types';

export interface HeatmapCell {
  day: number;      // 0-6 (days ago, 0 = today)
  hour: number;     // 0-23
  count: number;
  intensity: number; // 0-4 normalized
  activities: Activity[];
}

export interface HeatmapStats {
  todayCount: number;
  peakHour: number;
  peakDay: number;
  streakDays: number;
  totalWeek: number;
}

export function generateHeatmapData(activities: Activity[]): HeatmapCell[] {
  const now = new Date();
  const cells: HeatmapCell[] = [];
  
  // Initialize 7x24 grid
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      cells.push({ day, hour, count: 0, intensity: 0, activities: [] });
    }
  }
  
  // Count activities per cell
  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const diffMs = now.getTime() - date.getTime();
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysAgo >= 0 && daysAgo < 7) {
      const hour = date.getHours();
      const cellIndex = daysAgo * 24 + hour;
      if (cells[cellIndex]) {
        cells[cellIndex].count++;
        cells[cellIndex].activities.push(activity);
      }
    }
  });
  
  // Normalize to intensity (0-4)
  const maxCount = Math.max(...cells.map(c => c.count), 1);
  cells.forEach(cell => {
    cell.intensity = Math.min(4, Math.ceil((cell.count / maxCount) * 4));
  });
  
  return cells;
}

export function calculateHeatmapStats(activities: Activity[]): HeatmapStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Count today's activities
  const todayCount = activities.filter(a => {
    const date = new Date(a.timestamp);
    return date >= today;
  }).length;
  
  // Find peak hour
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  
  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const diffMs = now.getTime() - date.getTime();
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysAgo >= 0 && daysAgo < 7) {
      hourCounts[date.getHours()]++;
      dayCounts[daysAgo]++;
    }
  });
  
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakDay = dayCounts.indexOf(Math.max(...dayCounts));
  
  // Calculate streak (consecutive days with activity)
  let streakDays = 0;
  for (let i = 0; i < 7; i++) {
    if (dayCounts[i] > 0) {
      streakDays++;
    } else if (i > 0) {
      break; // Streak broken
    }
  }
  
  const totalWeek = activities.filter(a => {
    const date = new Date(a.timestamp);
    const diffMs = now.getTime() - date.getTime();
    return diffMs < 7 * 24 * 60 * 60 * 1000;
  }).length;
  
  return {
    todayCount,
    peakHour,
    peakDay,
    streakDays,
    totalWeek,
  };
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12AM';
  if (hour === 12) return '12PM';
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

export function getDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'TODAY';
  if (daysAgo === 1) return '-1D';
  return `-${daysAgo}D`;
}
