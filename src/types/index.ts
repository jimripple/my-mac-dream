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
  dailyDate?: string; // YYYY-MM-DD — set for daily journal notes
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

// OSINT command center prototype types
export type IntelSeverity = 'low' | 'moderate' | 'elevated' | 'critical';
export type IntelStatus = 'new' | 'triaging' | 'monitoring' | 'escalated' | 'closed';
export type SourceType = 'manual' | 'public_alert' | 'local_news' | 'weather' | 'community';

export interface IntelItem {
  id: string;
  title: string;
  summary: string;
  severity: IntelSeverity;
  confidence: number;
  source: string;
  sourceType: SourceType;
  location: string;
  timestamp: string;
  status: IntelStatus;
  tags: string[];
  url?: string;
}

export interface WatchEntity {
  id: string;
  name: string;
  type: 'person' | 'place' | 'event' | 'organization' | 'keyword';
  riskLevel: IntelSeverity;
  lastSeen: string;
  relatedItemIds: string[];
}

export interface SourceStatus {
  id: string;
  name: string;
  type: SourceType;
  health: 'online' | 'degraded' | 'manual' | 'paused';
  lastSync: string;
  itemCount: number;
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
