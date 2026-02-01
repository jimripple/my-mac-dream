import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes, useProjects } from '@/hooks/useStore';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { RelatedSuggestions } from '@/components/RelatedSuggestions';

export default function NewNote() {
  const navigate = useNavigate();
  const { createNote } = useNotes();
  const { projects } = useProjects();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const note = createNote({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      projectIds: selectedProjects,
      linkedNoteIds: [],
    });

    navigate(`/notes/${note.id}`);
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
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </button>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">New</span> Note
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="font-mono bg-surface border-border text-xl font-bold"
                autoFocus
              />
            </div>

            {/* Content */}
            <MarkdownEditor
              value={content}
              onChange={setContent}
              minHeight="350px"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/notes')}
              className="font-mono"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-mono flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Note
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
            text={`${title} ${content}`}
            projects={projects}
            selectedProjectIds={selectedProjects}
            onAddProject={handleAddSuggestedProject}
          />
        </div>
      </form>
    </div>
  );
}
