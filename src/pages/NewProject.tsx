import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useStore';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PROJECT_COLORS = [
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
];

export default function NewProject() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'completed' | 'archived'>('active');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const project = createProject({
      name: name.trim(),
      description: description.trim(),
      status,
      color,
      deadline: deadline || undefined,
    });

    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">New</span> Project
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Project Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name..."
            className="font-mono bg-surface border-border"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            className="font-mono bg-surface border-border min-h-[100px]"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Color
          </label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 border-2 transition-all ${
                  color === c ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Status
          </label>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="font-mono bg-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Deadline (Optional)
          </label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="font-mono bg-surface border-border"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/projects')}
            className="font-mono"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim()}
            className="font-mono flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}
