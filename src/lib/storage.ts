// Local storage utilities for myOS
import { Project, Note, Bookmark, Task, Activity } from '@/types';

const STORAGE_KEYS = {
  projects: 'myos_projects',
  notes: 'myos_notes',
  bookmarks: 'myos_bookmarks',
  tasks: 'myos_tasks',
  activities: 'myos_activities',
} as const;

// Generic storage helpers
function getFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Projects
export function getProjects(): Project[] {
  return getFromStorage<Project>(STORAGE_KEYS.projects, []);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    projects.push(project);
  }
  setToStorage(STORAGE_KEYS.projects, projects);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  setToStorage(STORAGE_KEYS.projects, projects);
}

// Notes
export function getNotes(): Note[] {
  return getFromStorage<Note>(STORAGE_KEYS.notes, []);
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === note.id);
  if (index >= 0) {
    notes[index] = { ...note, updatedAt: new Date().toISOString() };
  } else {
    notes.push(note);
  }
  setToStorage(STORAGE_KEYS.notes, notes);
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id);
  setToStorage(STORAGE_KEYS.notes, notes);
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  return getFromStorage<Bookmark>(STORAGE_KEYS.bookmarks, []);
}

export function saveBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex(b => b.id === bookmark.id);
  if (index >= 0) {
    bookmarks[index] = { ...bookmark, updatedAt: new Date().toISOString() };
  } else {
    bookmarks.push(bookmark);
  }
  setToStorage(STORAGE_KEYS.bookmarks, bookmarks);
}

export function deleteBookmark(id: string): void {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  setToStorage(STORAGE_KEYS.bookmarks, bookmarks);
}

// Tasks
export function getTasks(): Task[] {
  return getFromStorage<Task>(STORAGE_KEYS.tasks, []);
}

export function saveTask(task: Task): void {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tasks[index] = { ...task, updatedAt: new Date().toISOString() };
  } else {
    tasks.push(task);
  }
  setToStorage(STORAGE_KEYS.tasks, tasks);
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter(t => t.id !== id);
  setToStorage(STORAGE_KEYS.tasks, tasks);
}

// Activities
export function getActivities(): Activity[] {
  return getFromStorage<Activity>(STORAGE_KEYS.activities, []);
}

export function addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  // Keep only last 50 activities
  const updated = [newActivity, ...activities].slice(0, 50);
  setToStorage(STORAGE_KEYS.activities, updated);
}

// Export all data
export function exportData(): string {
  const data = {
    projects: getProjects(),
    notes: getNotes(),
    bookmarks: getBookmarks(),
    tasks: getTasks(),
    activities: getActivities(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

// Import data
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.projects) setToStorage(STORAGE_KEYS.projects, data.projects);
    if (data.notes) setToStorage(STORAGE_KEYS.notes, data.notes);
    if (data.bookmarks) setToStorage(STORAGE_KEYS.bookmarks, data.bookmarks);
    if (data.tasks) setToStorage(STORAGE_KEYS.tasks, data.tasks);
    if (data.activities) setToStorage(STORAGE_KEYS.activities, data.activities);
    return true;
  } catch {
    return false;
  }
}
