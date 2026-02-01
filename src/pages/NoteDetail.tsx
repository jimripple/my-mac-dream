import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes, useProjects } from '@/hooks/useStore';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { RelatedSuggestions } from '@/components/RelatedSuggestions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, updateNote, removeNote } = useNotes();
  const { projects } = useProjects();

  const note = notes.find(n => n.id === id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedProjects(note.projectIds);
    }
  }, [note]);

  if (!note) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p className="text-muted-foreground font-mono mb-4">Note not found</p>
        <Button onClick={() => navigate('/notes')} variant="outline">
          Back to Notes
        </Button>
      </div>
    );
  }

  const linkedProjects = projects.filter(p => note.projectIds.includes(p.id));
  const noteLinks = notes.map(n => ({ id: n.id, title: n.title }));

  const handleSave = () => {
    updateNote({
      ...note,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      projectIds: selectedProjects,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setSelectedProjects(note.projectIds);
    setIsEditing(false);
  };

  const handleDelete = () => {
    removeNote(note.id);
    navigate('/notes');
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
      <header className="mb-6">
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </button>

        <div className="flex items-center justify-between">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-2xl font-bold font-display bg-transparent border-none p-0 focus-visible:ring-0"
            />
          ) : (
            <h1 className="text-3xl font-bold font-display">{note.title}</h1>
          )}

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm" className="font-mono">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm" className="font-mono">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="font-mono"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="font-mono text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-mono">
          <span>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
          {linkedProjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Linked to:</span>
              {linkedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <div className="w-2 h-2" style={{ backgroundColor: project.color }} />
                  {project.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {/* Content */}
        <div className="col-span-2">
          {isEditing ? (
            <div className="space-y-4">
              {/* Toggle Preview */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 font-mono text-sm transition-colors",
                    !showPreview ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 font-mono text-sm transition-colors",
                    showPreview ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </div>

              {showPreview ? (
                <div className="bg-card border border-border p-6 min-h-[400px]">
                  <MarkdownPreview content={content} noteLinks={noteLinks} />
                </div>
              ) : (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  minHeight="400px"
                />
              )}
            </div>
          ) : (
            <div className="bg-card border border-border p-6 min-h-[400px]">
              <MarkdownPreview content={note.content} noteLinks={noteLinks} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Project Links */}
          {isEditing && projects.length > 0 && (
            <div className="bg-card border border-border p-4">
              <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider block mb-3">
                Linked Projects
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
          {isEditing && (
            <RelatedSuggestions
              text={`${title} ${content}`}
              projects={projects}
              selectedProjectIds={selectedProjects}
              onAddProject={handleAddSuggestedProject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
