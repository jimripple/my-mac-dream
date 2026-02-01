

# myOS - Personal Command Center

A retro-futuristic personal operating system that connects your projects, notes, bookmarks, and tasks through context—not folders.

---

## Design Philosophy

**Aesthetic**: Industrial revival meets sci-fi terminal
- Monospace typography (Space Mono / JetBrains Mono)
- High-contrast dark theme with accent color (amber, cyan, or orange glow)
- Subtle scan lines, grid backgrounds, and glowing borders
- Sharp edges, no rounded corners - brutalist with warmth
- Data visualizations that feel like ship consoles

---

## Core Features

### 1. Dashboard / Mission Control
The home view - a command center showing:
- **Active projects** with visual progress indicators (circular gauges, bar graphs)
- **Recent activity feed** - what you've touched lately
- **Quick capture** - fast input for notes, tasks, or bookmarks
- **Graph visualization** - an interactive map showing how projects, notes, and bookmarks connect

### 2. Projects Hub
Projects are contextual containers that items *belong to*, but items can span multiple projects:
- Create projects with description, status, and deadline
- Attach notes, bookmarks, and tasks to projects
- Progress visualization based on completed tasks
- "Radar" view showing related items and connections

### 3. Notes System
A focused writing environment:
- Distraction-free editor with markdown support
- Link notes to projects (or keep them floating)
- Notes can reference other notes (building your knowledge graph)
- Ready to receive Apple Notes data via future Tauri integration

### 4. Bookmarks Manager
Organized reference library:
- Add bookmarks manually with title, URL, and description
- Tag and connect to projects
- Visual cards showing site previews
- Search and filter by project context
- Architecture ready for Chrome bookmark import via Tauri

### 5. Task Tracker
Project-based to-do system:
- Tasks belong to projects
- Status states: backlog → in progress → done
- Due dates and priority levels
- Contributes to project progress visualization

### 6. Command Bar (Quick Search)
⌘K to open anywhere:
- Universal search across notes, bookmarks, tasks, and projects
- Quick actions: create note, add bookmark, new project
- Keyboard-first navigation throughout the app

### 7. Connection Graph (The "Big Picture")
The signature feature:
- Interactive visualization of your knowledge
- Nodes = projects, notes, bookmarks
- Edges = relationships between items
- Filter by project to see that project's constellation
- Click nodes to navigate

---

## Data Architecture

**Local-first storage** using browser localStorage/IndexedDB:
- All data stays on your machine
- Exportable to JSON for backup
- Structure designed for future cloud sync

---

## Future Roadmap (Post-Tauri Wrap)

1. **Apple Notes sync** via AppleScript bridge
2. **Chrome bookmarks import** from filesystem
3. **Cloud sync** with Supabase backend
4. **AI-powered connections** - suggest links between items

---

## Technical Notes

- Built with React, TypeScript, Tailwind CSS
- Recharts for visualizations
- Ready to be wrapped with Tauri for .dmg distribution
- Responsive but optimized for desktop-width screens

