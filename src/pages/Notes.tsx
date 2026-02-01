import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotes, useProjects } from '@/hooks/useStore';
import { Plus, FileText, Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

export default function Notes() {
  const { notes } = useNotes();
  const { projects } = useProjects();
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const getProjectNames = (projectIds: string[]) => {
    return projectIds
      .map(id => projects.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Get excerpt from content
  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <FileText className="h-4 w-4 text-primary" />
          <span>KNOWLEDGE BASE</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-display">
            <span className="text-primary glow-text">Notes</span> Archive
          </h1>
          <Link
            to="/notes/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 font-mono bg-card border-border"
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono mb-4">
            {search ? 'No notes match your search' : 'No notes yet'}
          </p>
          {!search && (
            <Link
              to="/notes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Note
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className="block p-4 bg-card border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold font-mono text-base truncate group-hover:text-primary transition-colors">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {getExcerpt(note.content)}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                    {note.projectIds.length > 0 && (
                      <span className="text-primary/70">
                        {getProjectNames(note.projectIds)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
