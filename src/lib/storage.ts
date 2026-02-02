// Storage layer for myOS
// Uses Tauri Store plugin when running in Tauri, falls back to localStorage in browser
import { Project, Note, Bookmark, Task, Activity } from '@/types';

const STORAGE_KEYS = {
  projects: 'myos_projects',
  notes: 'myos_notes',
  bookmarks: 'myos_bookmarks',
  tasks: 'myos_tasks',
  activities: 'myos_activities',
} as const;

// In-memory cache — all reads are synchronous from here
const cache: Record<string, unknown[]> = {
  [STORAGE_KEYS.projects]: [],
  [STORAGE_KEYS.notes]: [],
  [STORAGE_KEYS.bookmarks]: [],
  [STORAGE_KEYS.tasks]: [],
  [STORAGE_KEYS.activities]: [],
};

// Detect if running inside Tauri
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// Tauri Store instance (lazy-loaded)
let tauriStore: {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  save: () => Promise<void>;
} | null = null;

async function getTauriStore() {
  if (tauriStore) return tauriStore;
  const { LazyStore } = await import('@tauri-apps/plugin-store');
  tauriStore = new LazyStore('myos-data.json');
  return tauriStore;
}

// Persist a key to the appropriate backend
function persist(key: string, data: unknown[]): void {
  if (isTauri()) {
    // Fire-and-forget async write to Tauri Store
    getTauriStore().then(async (store) => {
      await store.set(key, data);
      await store.save();
    }).catch(console.error);
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// Initialize storage — loads data into memory cache
// Call this once at app startup before rendering
export async function initStorage(): Promise<void> {
  if (isTauri()) {
    try {
      const store = await getTauriStore();
      for (const key of Object.values(STORAGE_KEYS)) {
        const data = await store.get(key);
        cache[key] = Array.isArray(data) ? data : [];
      }
    } catch (err) {
      console.error('Failed to load from Tauri Store, falling back to defaults:', err);
    }
  } else {
    // Load from localStorage
    for (const key of Object.values(STORAGE_KEYS)) {
      try {
        const stored = localStorage.getItem(key);
        cache[key] = stored ? JSON.parse(stored) : [];
      } catch {
        cache[key] = [];
      }
    }
  }
}

// Generic cache helpers
function getFromCache<T>(key: string): T[] {
  return (cache[key] as T[]) || [];
}

function setToCache<T>(key: string, data: T[]): void {
  cache[key] = data;
  persist(key, data);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Projects
export function getProjects(): Project[] {
  return getFromCache<Project>(STORAGE_KEYS.projects);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    projects.push(project);
  }
  setToCache(STORAGE_KEYS.projects, projects);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  setToCache(STORAGE_KEYS.projects, projects);
}

// Notes
export function getNotes(): Note[] {
  return getFromCache<Note>(STORAGE_KEYS.notes);
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === note.id);
  if (index >= 0) {
    notes[index] = { ...note, updatedAt: new Date().toISOString() };
  } else {
    notes.push(note);
  }
  setToCache(STORAGE_KEYS.notes, notes);
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id);
  setToCache(STORAGE_KEYS.notes, notes);
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  return getFromCache<Bookmark>(STORAGE_KEYS.bookmarks);
}

export function saveBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex(b => b.id === bookmark.id);
  if (index >= 0) {
    bookmarks[index] = { ...bookmark, updatedAt: new Date().toISOString() };
  } else {
    bookmarks.push(bookmark);
  }
  setToCache(STORAGE_KEYS.bookmarks, bookmarks);
}

export function deleteBookmark(id: string): void {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  setToCache(STORAGE_KEYS.bookmarks, bookmarks);
}

// Tasks
export function getTasks(): Task[] {
  return getFromCache<Task>(STORAGE_KEYS.tasks);
}

export function saveTask(task: Task): void {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tasks[index] = { ...task, updatedAt: new Date().toISOString() };
  } else {
    tasks.push(task);
  }
  setToCache(STORAGE_KEYS.tasks, tasks);
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter(t => t.id !== id);
  setToCache(STORAGE_KEYS.tasks, tasks);
}

// Activities
export function getActivities(): Activity[] {
  return getFromCache<Activity>(STORAGE_KEYS.activities);
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
  setToCache(STORAGE_KEYS.activities, updated);
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
    if (data.projects) setToCache(STORAGE_KEYS.projects, data.projects);
    if (data.notes) setToCache(STORAGE_KEYS.notes, data.notes);
    if (data.bookmarks) setToCache(STORAGE_KEYS.bookmarks, data.bookmarks);
    if (data.tasks) setToCache(STORAGE_KEYS.tasks, data.tasks);
    if (data.activities) setToCache(STORAGE_KEYS.activities, data.activities);
    return true;
  } catch {
    return false;
  }
}
