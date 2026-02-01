import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks, useProjects } from '@/hooks/useStore';
import { ArrowLeft, Save, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RelatedSuggestions } from '@/components/RelatedSuggestions';

export default function NewBookmark() {
  const navigate = useNavigate();
  const { createBookmark } = useBookmarks();
  const { projects } = useProjects();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    // Add https if missing
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    createBookmark({
      title: title.trim() || getDomainFromUrl(finalUrl),
      url: finalUrl,
      description: description.trim() || undefined,
      projectIds: selectedProjects,
    });

    navigate('/bookmarks');
  };

  const getDomainFromUrl = (urlString: string) => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAddSuggestedProject = (projectId: string) => {
    if (!selectedProjects.includes(projectId)) {
      setSelectedProjects(prev => [...prev, projectId]);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate('/bookmarks')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookmarks
        </button>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">Add</span> Bookmark
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 space-y-6">
            {/* URL */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="font-mono bg-surface border-border pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Title (Optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bookmark title..."
                className="font-mono bg-surface border-border"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Description (Optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this bookmark useful?"
                className="font-mono bg-surface border-border min-h-[80px]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/bookmarks')}
              className="font-mono"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url.trim()}
              className="font-mono flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Bookmark
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Link to Projects */}
          {projects.length > 0 && (
            <div className="bg-card border border-border p-4">
              <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider block mb-3">
                Link to Projects
              </label>
              <div className="space-y-2">
                {projects.map((project) => (
                  <label
                    key={project.id}
                    className="flex items-center gap-3 p-2 hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => toggleProject(project.id)}
                    />
                    <div
                      className="w-3 h-3"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-mono text-sm">{project.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          <RelatedSuggestions
            text={`${title} ${url} ${description}`}
            projects={projects}
            selectedProjectIds={selectedProjects}
            onAddProject={handleAddSuggestedProject}
          />
        </div>
      </form>
    </div>
  );
}
