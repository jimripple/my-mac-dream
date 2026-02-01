import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useNotes, useBookmarks, useTasks, useActivities } from '@/hooks/useStore';
import { exportData, importData } from '@/lib/storage';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Database,
  FolderKanban,
  FileText,
  Bookmark,
  CheckSquare,
  Activity,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

export default function Settings() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();
  const { activities, refresh: refreshActivities } = useActivities();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      
      if (success) {
        setImportStatus('success');
        // Refresh data by navigating
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stats = [
    { icon: FolderKanban, label: 'Projects', count: projects.length },
    { icon: FileText, label: 'Notes', count: notes.length },
    { icon: Bookmark, label: 'Bookmarks', count: bookmarks.length },
    { icon: CheckSquare, label: 'Tasks', count: tasks.length },
    { icon: Activity, label: 'Activities', count: activities.length },
  ];

  // Estimate storage usage
  const estimatedSize = new Blob([exportData()]).size;
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <SettingsIcon className="h-4 w-4 text-primary" />
          <span>SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">Settings</span>
        </h1>
      </header>

      {/* Storage Stats */}
      <section className="bg-card border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold font-display uppercase tracking-wider">
            Storage Stats
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-4">
          {stats.map(({ icon: Icon, label, count }) => (
            <div key={label} className="text-center p-4 bg-surface border border-border">
              <Icon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold font-mono text-primary">{count}</p>
              <p className="text-xs text-muted-foreground font-mono uppercase">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm font-mono text-muted-foreground p-3 bg-surface border border-border">
          <span>Estimated Storage Used</span>
          <span className="text-foreground">{formatSize(estimatedSize)}</span>
        </div>
      </section>

      {/* Export/Import */}
      <section className="bg-card border border-border p-6">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider mb-4">
          Data Backup
        </h2>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 bg-surface border border-border">
            <div>
              <h3 className="font-mono font-bold">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your data as a JSON file
              </p>
            </div>
            <Button onClick={handleExport} className="font-mono">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 bg-surface border border-border">
            <div>
              <h3 className="font-mono font-bold">Import Data</h3>
              <p className="text-sm text-muted-foreground">
                Restore from a backup file (overwrites existing data)
              </p>
            </div>
            <div className="flex items-center gap-2">
              {importStatus === 'success' && (
                <span className="flex items-center gap-1 text-terminal-green text-sm font-mono">
                  <Check className="h-4 w-4" />
                  Imported
                </span>
              )}
              {importStatus === 'error' && (
                <span className="flex items-center gap-1 text-destructive text-sm font-mono">
                  <AlertTriangle className="h-4 w-4" />
                  Invalid file
                </span>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="font-mono">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Import Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will overwrite all existing data. Make sure you have a backup of your current data before proceeding.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 text-sm font-mono text-warning flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Data is stored locally in your browser. Clear browser data will delete everything. 
            Export regularly to avoid data loss.
          </span>
        </div>
      </section>

      {/* App Info */}
      <section className="mt-6 text-center text-sm text-muted-foreground font-mono">
        <p>myOS v1.0.0</p>
        <p className="mt-1">Your Personal Command Center</p>
      </section>
    </div>
  );
}
