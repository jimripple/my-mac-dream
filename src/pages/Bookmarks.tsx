import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks, useProjects } from '@/hooks/useStore';
import { Plus, Bookmark, Search, ExternalLink, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

export default function Bookmarks() {
  const { bookmarks } = useBookmarks();
  const { projects } = useProjects();
  const [search, setSearch] = useState('');

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.url.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getProjectNames = (projectIds: string[]) => {
    return projectIds
      .map(id => projects.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <span>REFERENCE LIBRARY</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-display">
            <span className="text-primary glow-text">Bookmark</span> Vault
          </h1>
          <Link
            to="/bookmarks/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Bookmark
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 font-mono bg-card border-border"
        />
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border">
          <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono mb-4">
            {search ? 'No bookmarks match your search' : 'No bookmarks yet'}
          </p>
          {!search && (
            <Link
              to="/bookmarks/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add First Bookmark
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="p-4 bg-card border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-surface border border-border flex items-center justify-center flex-shrink-0">
                  {bookmark.favicon ? (
                    <img 
                      src={bookmark.favicon} 
                      alt="" 
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold font-mono text-sm truncate group-hover:text-primary transition-colors">
                    {bookmark.title}
                  </h3>
                  <a 
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
                  >
                    {getDomain(bookmark.url)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {bookmark.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                    </span>
                    {bookmark.projectIds.length > 0 && (
                      <span className="text-primary/70 truncate">
                        {getProjectNames(bookmark.projectIds)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
