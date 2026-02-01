import { useState } from 'react';
import { useTasks, useProjects } from '@/hooks/useStore';
import { Plus, CheckSquare, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Tasks() {
  const { tasks, createTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'backlog' | 'in_progress' | 'done'>('all');

  const filteredTasks = tasks.filter(t => 
    filter === 'all' ? true : t.status === filter
  );

  // Group tasks by status
  const tasksByStatus = {
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    createTask({
      title: newTaskTitle.trim(),
      projectId: selectedProjectId,
      status: 'backlog',
      priority: 'medium',
    });

    setNewTaskTitle('');
  };

  const cycleStatus = (task: Task) => {
    const statusOrder: Task['status'][] = ['backlog', 'in_progress', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateTask({ ...task, status: nextStatus });
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'backlog': return Circle;
      case 'in_progress': return Clock;
      case 'done': return CheckCircle2;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'backlog': return 'text-muted-foreground';
      case 'in_progress': return 'text-warning';
      case 'done': return 'text-terminal-green';
    }
  };

  const getProjectColor = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.color || '#888';
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>TASK TRACKER</span>
        </div>
        <h1 className="text-3xl font-bold font-display">
          <span className="text-primary glow-text">Task</span> Queue
        </h1>
      </header>

      {/* Quick Add */}
      {projects.length > 0 && (
        <div className="bg-card border border-border p-4 mb-6">
          <div className="flex gap-3">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-48 font-mono bg-surface border-border">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
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
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 font-mono bg-surface border-border"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || !selectedProjectId}
              className="font-mono"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'backlog', 'in_progress', 'done'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-3 py-1.5 font-mono text-sm border transition-colors",
              filter === status
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
            <span className="ml-2 text-xs opacity-70">
              ({status === 'all' ? tasks.length : tasksByStatus[status as keyof typeof tasksByStatus]?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border">
          <CheckSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono mb-4">
            {projects.length === 0 
              ? 'Create a project first to add tasks'
              : 'No tasks yet. Add one above!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            
            return (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <button
                  onClick={() => cycleStatus(task)}
                  className={cn(
                    "transition-colors",
                    getStatusColor(task.status)
                  )}
                >
                  <StatusIcon className="h-5 w-5" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-mono text-sm",
                    task.status === 'done' && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2"
                    style={{ backgroundColor: getProjectColor(task.projectId) }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {getProjectName(task.projectId)}
                  </span>
                </div>
                
                <span className={cn(
                  "text-[10px] font-mono uppercase px-2 py-0.5 bg-surface",
                  task.priority === 'high' && "text-destructive",
                  task.priority === 'medium' && "text-warning",
                  task.priority === 'low' && "text-muted-foreground"
                )}>
                  {task.priority}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
