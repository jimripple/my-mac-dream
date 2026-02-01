// myOS Core Types

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  color: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  projectIds: string[];
  linkedNoteIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  projectIds: string[];
  favicon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: 'backlog' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'project_created' | 'note_created' | 'note_updated' | 'bookmark_added' | 'task_completed' | 'task_created';
  entityId: string;
  entityType: 'project' | 'note' | 'bookmark' | 'task';
  title: string;
  timestamp: string;
}

// Graph visualization types
export interface GraphNode {
  id: string;
  type: 'project' | 'note' | 'bookmark';
  label: string;
  color: string;
  size: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'belongs_to' | 'references';
}

// Command bar types
export type CommandAction = 
  | { type: 'navigate'; path: string }
  | { type: 'create'; entityType: 'project' | 'note' | 'bookmark' | 'task' }
  | { type: 'search'; query: string };

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  action: CommandAction;
  keywords?: string[];
}
