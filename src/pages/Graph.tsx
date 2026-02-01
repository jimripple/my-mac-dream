import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects, useNotes, useBookmarks, useTasks } from '@/hooks/useStore';
import { Network, Filter, X } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function Graph() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();
  
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(
    searchParams.get('focus') || null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const urlFocus = searchParams.get('focus');
    if (urlFocus !== focusedProjectId) {
      setFocusedProjectId(urlFocus);
    }
  }, [searchParams]);

  // Handle focus change with transition
  const handleFocusChange = (projectId: string | null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setFocusedProjectId(projectId);
      if (projectId) {
        setSearchParams({ focus: projectId });
      } else {
        setSearchParams({});
      }
      setTimeout(() => setIsTransitioning(false), 400);
    }, 50);
  };

  const focusedProject = focusedProjectId 
    ? projects.find(p => p.id === focusedProjectId) 
    : null;

  // Create graph data
  const graphData = useMemo(() => {
    const nodes: Array<{
      id: string;
      name: string;
      type: 'project' | 'note' | 'bookmark' | 'task';
      connections: number;
      x: number;
      y: number;
      color: string;
    }> = [];

    // Filter data based on focus
    const filteredProjects = focusedProjectId 
      ? projects.filter(p => p.id === focusedProjectId)
      : projects;
    
    const filteredNotes = focusedProjectId
      ? notes.filter(n => n.projectIds.includes(focusedProjectId))
      : notes;
    
    const filteredBookmarks = focusedProjectId
      ? bookmarks.filter(b => b.projectIds.includes(focusedProjectId))
      : bookmarks;
    
    const filteredTasks = focusedProjectId
      ? tasks.filter(t => t.projectId === focusedProjectId)
      : [];

    // Add projects (center)
    filteredProjects.forEach((project, i) => {
      const angle = (2 * Math.PI * i) / Math.max(filteredProjects.length, 1);
      const radius = focusedProjectId ? 0 : 30; // Center when focused
      nodes.push({
        id: project.id,
        name: project.name,
        type: 'project',
        connections: 0,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        color: project.color,
      });
    });

    // Add notes (inner ring when focused)
    filteredNotes.forEach((note, i) => {
      const angle = (2 * Math.PI * i) / Math.max(filteredNotes.length, 1) + 0.5;
      const radius = focusedProjectId ? 25 : 60;
      nodes.push({
        id: note.id,
        name: note.title || 'Untitled',
        type: 'note',
        connections: note.projectIds.length + note.linkedNoteIds.length,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        color: '#06b6d4', // cyan
      });
    });

    // Add bookmarks (outer ring)
    filteredBookmarks.forEach((bookmark, i) => {
      const angle = (2 * Math.PI * i) / Math.max(filteredBookmarks.length, 1) + 1;
      const radius = focusedProjectId ? 40 : 70;
      nodes.push({
        id: bookmark.id,
        name: bookmark.title,
        type: 'bookmark',
        connections: bookmark.projectIds.length,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        color: '#10b981', // emerald
      });
    });

    // Add tasks when focused on a project
    filteredTasks.forEach((task, i) => {
      const angle = (2 * Math.PI * i) / Math.max(filteredTasks.length, 1) + 1.5;
      const radius = 55;
      nodes.push({
        id: task.id,
        name: task.title,
        type: 'task',
        connections: 1,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        color: '#f59e0b', // amber for tasks
      });
    });

    return nodes;
  }, [projects, notes, bookmarks, tasks, focusedProjectId]);

  const totalItems = graphData.length;
  const allItemsCount = projects.length + notes.length + bookmarks.length + 
    (focusedProjectId ? tasks.filter(t => t.projectId === focusedProjectId).length : 0);

  // Calculate connections count
  const connectionCount = useMemo(() => {
    let count = 0;
    const filteredNotes = focusedProjectId
      ? notes.filter(n => n.projectIds.includes(focusedProjectId))
      : notes;
    const filteredBookmarks = focusedProjectId
      ? bookmarks.filter(b => b.projectIds.includes(focusedProjectId))
      : bookmarks;
    
    filteredNotes.forEach(note => {
      count += note.projectIds.length;
      count += note.linkedNoteIds.length;
    });
    filteredBookmarks.forEach(bookmark => {
      count += bookmark.projectIds.length;
    });
    if (focusedProjectId) {
      count += tasks.filter(t => t.projectId === focusedProjectId).length;
    }
    return count;
  }, [notes, bookmarks, tasks, focusedProjectId]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <Network className="h-4 w-4 text-primary" />
          <span>KNOWLEDGE GRAPH</span>
        </div>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">The Big</span> Picture
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-2">
          Visualizing connections between your projects, notes, and bookmarks
        </p>
      </header>

      {/* Project Focus Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground uppercase">Focus:</span>
        </div>
        <Select
          value={focusedProjectId || 'all'}
          onValueChange={(value) => handleFocusChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[200px] font-mono text-sm">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id} className="font-mono">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2" 
                    style={{ backgroundColor: project.color }} 
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {focusedProject && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-primary">
              NEURAL_LINK: {focusedProject.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFocusChange(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {focusedProjectId && (
          <span className="text-xs font-mono text-muted-foreground ml-auto">
            Showing {totalItems} of {allItemsCount} nodes
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Visible Nodes" value={totalItems} />
        <StatCard label="Projects" value={focusedProjectId ? 1 : projects.length} color="#f59e0b" />
        <StatCard label="Notes" value={focusedProjectId ? notes.filter(n => n.projectIds.includes(focusedProjectId)).length : notes.length} color="#06b6d4" />
        <StatCard label="Bookmarks" value={focusedProjectId ? bookmarks.filter(b => b.projectIds.includes(focusedProjectId)).length : bookmarks.length} color="#10b981" />
      </div>

      {/* Graph Visualization */}
      <div className="bg-card border border-border p-6 relative overflow-hidden">
        {graphData.length === 0 && !focusedProjectId ? (
          <div className="text-center py-16">
            <Network className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono">
              Your knowledge graph is empty.
            </p>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Create projects, notes, and bookmarks to see them visualized here.
            </p>
          </div>
        ) : graphData.length === 0 && focusedProjectId ? (
          <div className="text-center py-16">
            <Network className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono">
              No connected items for this project.
            </p>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Link notes, bookmarks, or create tasks to build connections.
            </p>
          </div>
        ) : (
          <>
            {/* Grid background */}
            <div className="absolute inset-0 grid-bg opacity-30" />
            
            <div className={cn(
              "relative h-[500px]",
              isTransitioning && "node-transition"
            )}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                  <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                  <ZAxis type="number" dataKey="connections" range={[100, 500]} />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border p-3 font-mono text-sm">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {data.type}
                            </p>
                            {data.connections > 0 && (
                              <p className="text-xs text-primary mt-1">
                                {data.connections} connections
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={graphData} shape="circle">
                    {graphData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                        fillOpacity={0.6}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <LegendItem color="#f59e0b" label="Projects" />
              <LegendItem color="#06b6d4" label="Notes" />
              <LegendItem color="#10b981" label="Bookmarks" />
              {focusedProjectId && <LegendItem color="#f59e0b" label="Tasks" />}
            </div>
          </>
        )}
      </div>

      {/* Connection Summary */}
      <div className="mt-6 bg-card border border-border p-6">
        <h2 className="text-lg font-bold font-display mb-4">Connection Summary</h2>
        <div className="grid grid-cols-2 gap-4 font-mono text-sm">
          <div className="p-4 bg-surface">
            <span className="text-muted-foreground">Total Connections:</span>
            <span className="ml-2 text-primary font-bold">{connectionCount}</span>
          </div>
          <div className="p-4 bg-surface">
            <span className="text-muted-foreground">Avg per Item:</span>
            <span className="ml-2 text-primary font-bold">
              {totalItems > 0 ? (connectionCount / totalItems).toFixed(1) : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-card border border-border p-4">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold font-display" style={{ color: color || 'hsl(var(--foreground))' }}>
        {value}
      </p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <div 
        className="w-3 h-3" 
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
