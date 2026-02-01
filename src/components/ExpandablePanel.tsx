import { ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandablePanelProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

export function ExpandablePanel({ children, onClick, className }: ExpandablePanelProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer transition-all duration-200",
        "hover:ring-1 hover:ring-primary/50",
        className
      )}
    >
      {/* Expand icon indicator */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="p-1 bg-background/80 backdrop-blur-sm border border-border">
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      
      {children}
    </div>
  );
}
