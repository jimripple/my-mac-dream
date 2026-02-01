import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { suggestProjects, ProjectSuggestion } from '@/lib/suggestions';
import { Lightbulb, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedSuggestionsProps {
  text: string;
  projects: Project[];
  selectedProjectIds: string[];
  onAddProject: (projectId: string) => void;
  className?: string;
}

export function RelatedSuggestions({
  text,
  projects,
  selectedProjectIds,
  onAddProject,
  className,
}: RelatedSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Debounce suggestions
    const timer = setTimeout(() => {
      const newSuggestions = suggestProjects(
        text,
        projects,
        [...selectedProjectIds, ...Array.from(dismissed)]
      );
      setSuggestions(newSuggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [text, projects, selectedProjectIds, dismissed]);

  const handleDismiss = (projectId: string) => {
    setDismissed(prev => new Set([...prev, projectId]));
  };

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("bg-card border border-border p-4", className)}>
      <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
        <Lightbulb className="h-4 w-4 text-warning" />
        <span>Related Projects</span>
      </div>
      
      <div className="space-y-2">
        {suggestions.map(({ project, score, matchingKeywords }) => (
          <div
            key={project.id}
            className="flex items-center gap-3 p-2 bg-surface border border-border group"
          >
            <div
              className="w-3 h-3 flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm truncate">{project.name}</p>
              {matchingKeywords.length > 0 && (
                <p className="text-[10px] text-muted-foreground font-mono">
                  Matches: {matchingKeywords.join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onAddProject(project.id)}
                className="p-1 text-terminal-green hover:bg-terminal-green/10 transition-colors"
                title="Add connection"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(project.id)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
