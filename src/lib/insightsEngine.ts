// Smart Insights Engine - Generates actionable recommendations
import { Project, Note, Bookmark, Task, Activity } from '@/types';

export interface Insight {
  id: string;
  type: 'warning' | 'suggestion' | 'prediction' | 'nudge';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    label: string;
    path?: string;
    command?: string;
  };
  entityId?: string;
  entityType?: 'project' | 'note' | 'task' | 'bookmark';
}

interface InsightContext {
  projects: Project[];
  notes: Note[];
  bookmarks: Bookmark[];
  tasks: Task[];
  activities: Activity[];
}

export function generateInsights(context: InsightContext): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();

  // 1. Overdue Tasks
  const overdueTasks = context.tasks.filter(task => {
    if (task.status === 'done' || !task.dueDate) return false;
    return new Date(task.dueDate) < now;
  });

  if (overdueTasks.length > 0) {
    const highPriorityOverdue = overdueTasks.filter(t => t.priority === 'high');
    insights.push({
      id: 'overdue-tasks',
      type: 'warning',
      priority: highPriorityOverdue.length > 0 ? 'high' : 'medium',
      title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
      description: highPriorityOverdue.length > 0 
        ? `Including ${highPriorityOverdue.length} high-priority. Reschedule or complete now.`
        : 'Consider rescheduling or marking as complete.',
      action: { label: 'View Tasks', path: '/tasks' },
    });
  }

  // 2. Tasks due soon (next 3 days)
  const dueSoon = context.tasks.filter(task => {
    if (task.status === 'done' || !task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const daysUntil = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 3;
  });

  if (dueSoon.length > 0) {
    insights.push({
      id: 'due-soon',
      type: 'nudge',
      priority: 'medium',
      title: `${dueSoon.length} task${dueSoon.length > 1 ? 's' : ''} due within 3 days`,
      description: dueSoon.map(t => t.title).slice(0, 2).join(', ') + (dueSoon.length > 2 ? '...' : ''),
      action: { label: 'Plan Ahead', path: '/tasks' },
    });
  }

  // 3. Idle Projects (no activity in 7+ days)
  const projectActivity = new Map<string, Date>();
  context.activities.forEach(activity => {
    if (activity.entityType === 'project') {
      const existing = projectActivity.get(activity.entityId);
      const activityDate = new Date(activity.timestamp);
      if (!existing || activityDate > existing) {
        projectActivity.set(activity.entityId, activityDate);
      }
    }
  });

  // Also check for task/note/bookmark activity related to projects
  context.tasks.forEach(task => {
    const date = new Date(task.updatedAt);
    const existing = projectActivity.get(task.projectId);
    if (!existing || date > existing) {
      projectActivity.set(task.projectId, date);
    }
  });

  const activeProjects = context.projects.filter(p => p.status === 'active');
  const idleProjects = activeProjects.filter(project => {
    const lastActivity = projectActivity.get(project.id);
    if (!lastActivity) {
      // Check creation date
      const created = new Date(project.createdAt);
      const daysSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated > 7;
    }
    const daysSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  });

  idleProjects.slice(0, 2).forEach(project => {
    insights.push({
      id: `idle-project-${project.id}`,
      type: 'suggestion',
      priority: 'low',
      title: `"${project.name}" has been idle`,
      description: 'No activity in over a week. Archive it or add a task to resume?',
      action: { label: 'View Project', path: `/projects/${project.id}` },
      entityId: project.id,
      entityType: 'project',
    });
  });

  // 4. Orphaned Notes (no project links)
  const orphanedNotes = context.notes.filter(note => 
    note.projectIds.length === 0 && note.linkedNoteIds.length === 0
  );

  if (orphanedNotes.length > 0) {
    insights.push({
      id: 'orphaned-notes',
      type: 'suggestion',
      priority: 'low',
      title: `${orphanedNotes.length} unconnected note${orphanedNotes.length > 1 ? 's' : ''}`,
      description: 'These notes have no project or note links. Add connections to build your knowledge web.',
      action: { label: 'View Notes', path: '/notes' },
    });
  }

  // 5. Productivity Prediction (task velocity)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = context.activities.filter(a => 
    a.type === 'task_completed' && new Date(a.timestamp) > sevenDaysAgo
  ).length;

  const pendingTasks = context.tasks.filter(t => t.status !== 'done').length;
  
  if (completedThisWeek > 0 && pendingTasks > 0) {
    const weeksToComplete = Math.ceil(pendingTasks / completedThisWeek);
    const completionDate = new Date(now.getTime() + weeksToComplete * 7 * 24 * 60 * 60 * 1000);
    
    insights.push({
      id: 'velocity-prediction',
      type: 'prediction',
      priority: 'low',
      title: `Current velocity: ${completedThisWeek} tasks/week`,
      description: `At this pace, ${pendingTasks} pending tasks will clear by ${completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
      action: { label: 'View Stats', path: '/graph' },
    });
  } else if (pendingTasks > 0 && completedThisWeek === 0) {
    insights.push({
      id: 'no-velocity',
      type: 'nudge',
      priority: 'medium',
      title: 'No tasks completed this week',
      description: `${pendingTasks} tasks waiting. Complete one to build momentum.`,
      action: { label: 'Start Now', path: '/tasks' },
    });
  }

  // 6. Upcoming Deadline
  const projectsWithDeadlines = context.projects.filter(p => 
    p.status === 'active' && p.deadline
  );
  
  projectsWithDeadlines.forEach(project => {
    const deadline = new Date(project.deadline!);
    const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntil > 0 && daysUntil <= 7) {
      const projectTasks = context.tasks.filter(t => t.projectId === project.id);
      const incomplete = projectTasks.filter(t => t.status !== 'done').length;
      
      insights.push({
        id: `deadline-${project.id}`,
        type: 'warning',
        priority: daysUntil <= 3 ? 'high' : 'medium',
        title: `"${project.name}" deadline in ${Math.ceil(daysUntil)} day${Math.ceil(daysUntil) > 1 ? 's' : ''}`,
        description: incomplete > 0 
          ? `${incomplete} task${incomplete > 1 ? 's' : ''} still incomplete.`
          : 'All tasks complete! Ready to wrap up.',
        action: { label: 'View Project', path: `/projects/${project.id}` },
        entityId: project.id,
        entityType: 'project',
      });
    }
  });

  // 7. Suggestion to connect items
  if (context.projects.length > 0 && context.bookmarks.length > 0) {
    const unlinkedBookmarks = context.bookmarks.filter(b => b.projectIds.length === 0);
    if (unlinkedBookmarks.length >= 3) {
      insights.push({
        id: 'unlinked-bookmarks',
        type: 'suggestion',
        priority: 'low',
        title: `${unlinkedBookmarks.length} bookmarks without projects`,
        description: 'Link them to projects to keep research organized.',
        action: { label: 'Organize', path: '/bookmarks' },
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights.slice(0, 5); // Return top 5 insights
}
