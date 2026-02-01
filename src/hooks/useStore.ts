// React hooks for myOS data management
import { useState, useEffect, useCallback } from 'react';
import { Project, Note, Bookmark, Task, Activity } from '@/types';
import * as storage from '@/lib/storage';

// Projects hook
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProjects(storage.getProjects());
    setLoading(false);
  }, []);

  const createProject = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const project: Project = {
      ...data,
      id: storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveProject(project);
    storage.addActivity({
      type: 'project_created',
      entityId: project.id,
      entityType: 'project',
      title: `Created project "${project.name}"`,
    });
    setProjects(storage.getProjects());
    return project;
  }, []);

  const updateProject = useCallback((project: Project) => {
    storage.saveProject(project);
    setProjects(storage.getProjects());
  }, []);

  const removeProject = useCallback((id: string) => {
    storage.deleteProject(id);
    setProjects(storage.getProjects());
  }, []);

  return { projects, loading, createProject, updateProject, removeProject };
}

// Notes hook
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNotes(storage.getNotes());
    setLoading(false);
  }, []);

  const createNote = useCallback((data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: Note = {
      ...data,
      id: storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveNote(note);
    storage.addActivity({
      type: 'note_created',
      entityId: note.id,
      entityType: 'note',
      title: `Created note "${note.title}"`,
    });
    setNotes(storage.getNotes());
    return note;
  }, []);

  const updateNote = useCallback((note: Note) => {
    storage.saveNote(note);
    storage.addActivity({
      type: 'note_updated',
      entityId: note.id,
      entityType: 'note',
      title: `Updated note "${note.title}"`,
    });
    setNotes(storage.getNotes());
  }, []);

  const removeNote = useCallback((id: string) => {
    storage.deleteNote(id);
    setNotes(storage.getNotes());
  }, []);

  return { notes, loading, createNote, updateNote, removeNote };
}

// Bookmarks hook
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBookmarks(storage.getBookmarks());
    setLoading(false);
  }, []);

  const createBookmark = useCallback((data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const bookmark: Bookmark = {
      ...data,
      id: storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveBookmark(bookmark);
    storage.addActivity({
      type: 'bookmark_added',
      entityId: bookmark.id,
      entityType: 'bookmark',
      title: `Added bookmark "${bookmark.title}"`,
    });
    setBookmarks(storage.getBookmarks());
    return bookmark;
  }, []);

  const updateBookmark = useCallback((bookmark: Bookmark) => {
    storage.saveBookmark(bookmark);
    setBookmarks(storage.getBookmarks());
  }, []);

  const removeBookmark = useCallback((id: string) => {
    storage.deleteBookmark(id);
    setBookmarks(storage.getBookmarks());
  }, []);

  return { bookmarks, loading, createBookmark, updateBookmark, removeBookmark };
}

// Tasks hook
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTasks(storage.getTasks());
    setLoading(false);
  }, []);

  const createTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...data,
      id: storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveTask(task);
    storage.addActivity({
      type: 'task_created',
      entityId: task.id,
      entityType: 'task',
      title: `Created task "${task.title}"`,
    });
    setTasks(storage.getTasks());
    return task;
  }, []);

  const updateTask = useCallback((task: Task) => {
    const oldTask = tasks.find(t => t.id === task.id);
    storage.saveTask(task);
    
    // Log activity if task was completed
    if (oldTask?.status !== 'done' && task.status === 'done') {
      storage.addActivity({
        type: 'task_completed',
        entityId: task.id,
        entityType: 'task',
        title: `Completed task "${task.title}"`,
      });
    }
    
    setTasks(storage.getTasks());
  }, [tasks]);

  const removeTask = useCallback((id: string) => {
    storage.deleteTask(id);
    setTasks(storage.getTasks());
  }, []);

  return { tasks, loading, createTask, updateTask, removeTask };
}

// Activities hook
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setActivities(storage.getActivities());
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  return { activities, loading, refresh };
}

// Computed stats
export function useStats() {
  const { projects } = useProjects();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const { tasks } = useTasks();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    projectCount: projects.length,
    activeProjects,
    noteCount: notes.length,
    bookmarkCount: bookmarks.length,
    taskCount: totalTasks,
    completedTasks,
    taskProgress,
  };
}
