import { useMemo } from 'react';
import { useProjects, useNotes, useBookmarks } from '@/hooks/useStore';
import { Network } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Graph() {
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();

  // Create graph data
  const graphData = useMemo(() => {
    const nodes: Array<{
      id: string;
      name: string;
      type: 'project' | 'note' | 'bookmark';
      connections: number;
      x: number;
      y: number;
      color: string;
    }> = [];

    // Add projects (center)
    projects.forEach((project, i) => {
      const angle = (2 * Math.PI * i) / Math.max(projects.length, 1);
      const radius = 30;
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

    // Add notes (outer ring)
    notes.forEach((note, i) => {
      const angle = (2 * Math.PI * i) / Math.max(notes.length, 1) + 0.5;
      const radius = 60;
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

    // Add bookmarks (outer ring, offset)
    bookmarks.forEach((bookmark, i) => {
      const angle = (2 * Math.PI * i) / Math.max(bookmarks.length, 1) + 1;
      const radius = 70;
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

    return nodes;
  }, [projects, notes, bookmarks]);

  const totalItems = projects.length + notes.length + bookmarks.length;

  // Calculate connections count
  const connectionCount = useMemo(() => {
    let count = 0;
    notes.forEach(note => {
      count += note.projectIds.length;
      count += note.linkedNoteIds.length;
    });
    bookmarks.forEach(bookmark => {
      count += bookmark.projectIds.length;
    });
    return count;
  }, [notes, bookmarks]);

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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Items" value={totalItems} />
        <StatCard label="Projects" value={projects.length} color="#f59e0b" />
        <StatCard label="Notes" value={notes.length} color="#06b6d4" />
        <StatCard label="Bookmarks" value={bookmarks.length} color="#10b981" />
      </div>

      {/* Graph Visualization */}
      <div className="bg-card border border-border p-6 relative overflow-hidden">
        {totalItems === 0 ? (
          <div className="text-center py-16">
            <Network className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono">
              Your knowledge graph is empty.
            </p>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Create projects, notes, and bookmarks to see them visualized here.
            </p>
          </div>
        ) : (
          <>
            {/* Grid background */}
            <div className="absolute inset-0 grid-bg opacity-30" />
            
            <div className="relative h-[500px]">
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
