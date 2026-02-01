import { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartInsights } from './SmartInsights';
import { ActivityHeatmap } from './ActivityHeatmap';
import { FullActivityLog } from './FullActivityLog';
import { FullProjectsGrid } from './FullProjectsGrid';

type PanelType = 'insights' | 'heatmap' | 'activity' | 'projects';

interface FocusedPanelViewProps {
  panel: PanelType;
  onBack: () => void;
}

function getPanelTitle(panel: PanelType): string {
  switch (panel) {
    case 'insights':
      return 'Smart_Insights';
    case 'heatmap':
      return 'System_Pulse';
    case 'activity':
      return 'Activity_Log';
    case 'projects':
      return 'Active_Projects';
    default:
      return 'Panel';
  }
}

export function FocusedPanelView({ panel, onBack }: FocusedPanelViewProps) {
  // Handle Escape key to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div className="h-full flex flex-col p-6 animate-scale-in">
      {/* Back header */}
      <header className="flex-shrink-0 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-mono">Mission Control</span>
        </button>
        <h1 className="text-2xl font-bold font-display mt-2 uppercase tracking-wider">
          <span className="text-primary glow-text">{getPanelTitle(panel).split('_')[0]}</span>
          <span>_{getPanelTitle(panel).split('_')[1]}</span>
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Press <kbd className="px-1.5 py-0.5 bg-muted border border-border text-[10px]">ESC</kbd> to return
        </p>
      </header>

      {/* Full expanded panel content */}
      <div className="flex-1 overflow-hidden">
        {panel === 'insights' && <SmartInsights compact={false} className="h-full" />}
        {panel === 'heatmap' && <ActivityHeatmap compact={false} />}
        {panel === 'activity' && <FullActivityLog />}
        {panel === 'projects' && <FullProjectsGrid />}
      </div>
    </div>
  );
}
