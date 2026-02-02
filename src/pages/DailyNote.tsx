import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes, useProjects } from '@/hooks/useStore';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Save,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export default function DailyNote() {
  const { date: dateParam } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { notes, createNote, updateNote } = useNotes();
  const { projects } = useProjects();

  const currentDate = useMemo(() => {
    if (dateParam) {
      try {
        return parseISO(dateParam);
      } catch {
        return new Date();
      }
    }
    return new Date();
  }, [dateParam]);

  const dateKey = toDateString(currentDate);

  // Find existing daily note for this date
  const existingNote = useMemo(
    () => notes.find((n) => n.dailyDate === dateKey),
    [notes, dateKey]
  );

  const [content, setContent] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Sync state when the note or date changes
  useEffect(() => {
    if (existingNote) {
      setContent(existingNote.content);
      setSelectedProjects(existingNote.projectIds);
    } else {
      setContent('');
      setSelectedProjects([]);
    }
    setHasUnsaved(false);
    setShowPreview(false);
  }, [existingNote, dateKey]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsaved(true);
  };

  const handleSave = () => {
    const title = format(currentDate, "'Daily' — MMM d, yyyy");

    if (existingNote) {
      updateNote({
        ...existingNote,
        content: content.trim(),
        projectIds: selectedProjects,
      });
    } else {
      createNote({
        title,
        content: content.trim(),
        projectIds: selectedProjects,
        linkedNoteIds: [],
        dailyDate: dateKey,
      });
    }
    setHasUnsaved(false);
  };

  const goToDate = (date: Date) => {
    navigate(`/notes/daily/${toDateString(date)}`);
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
    setHasUnsaved(true);
  };

  const noteLinks = notes.map((n) => ({ id: n.id, title: n.title }));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>DAILY JOURNAL</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToDate(subDays(currentDate, 1))}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface border border-border transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-2xl font-bold font-display">
                <span className="text-primary glow-text">
                  {format(currentDate, 'EEEE')}
                </span>
                <span className="text-muted-foreground ml-2 text-lg">
                  {format(currentDate, 'MMM d, yyyy')}
                </span>
              </h1>
              {isToday(currentDate) && (
                <span className="text-[10px] uppercase tracking-wider text-primary font-mono">
                  Today
                </span>
              )}
            </div>

            <button
              onClick={() => goToDate(addDays(currentDate, 1))}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface border border-border transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {!isToday(currentDate) && (
              <button
                onClick={() => goToDate(new Date())}
                className="ml-2 px-3 py-1 text-xs font-mono text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {hasUnsaved && (
              <span className="text-[10px] font-mono text-yellow-500 mr-2">
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSave}
              size="sm"
              className="font-mono"
              disabled={!hasUnsaved && !!existingNote}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {/* Editor */}
        <div className="col-span-2 space-y-4">
          {/* Toggle Preview */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 font-mono text-sm transition-colors',
                !showPreview
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Edit className="h-4 w-4" />
              Write
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 font-mono text-sm transition-colors',
                showPreview
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>

          {showPreview ? (
            <div className="bg-card border border-border p-6 min-h-[500px]">
              {content.trim() ? (
                <MarkdownPreview content={content} noteLinks={noteLinks} />
              ) : (
                <p className="text-muted-foreground font-mono text-sm italic">
                  Nothing written yet...
                </p>
              )}
            </div>
          ) : (
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              minHeight="500px"
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Link to Projects */}
          {projects.length > 0 && (
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

          {/* Recent daily notes */}
          <div className="bg-card border border-border p-4">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider block mb-3">
              Recent Entries
            </label>
            <div className="space-y-1">
              {notes
                .filter((n) => n.dailyDate && n.dailyDate !== dateKey)
                .sort((a, b) => (b.dailyDate! > a.dailyDate! ? 1 : -1))
                .slice(0, 7)
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => goToDate(parseISO(n.dailyDate!))}
                    className={cn(
                      'w-full text-left px-2 py-1.5 text-xs font-mono transition-colors hover:bg-surface hover:text-foreground',
                      'text-muted-foreground'
                    )}
                  >
                    {format(parseISO(n.dailyDate!), 'EEE, MMM d')}
                    <span className="text-muted-foreground/50 ml-2">
                      {n.content.length > 40
                        ? n.content.substring(0, 40) + '...'
                        : n.content || 'Empty'}
                    </span>
                  </button>
                ))}
              {notes.filter((n) => n.dailyDate && n.dailyDate !== dateKey)
                .length === 0 && (
                <p className="text-[10px] text-muted-foreground font-mono py-2">
                  No other entries yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
