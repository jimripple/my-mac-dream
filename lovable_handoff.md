myOS - Developer Handoff Document
Project Identity
myOS is a personal productivity hub and command center designed as a native macOS application. It organizes projects, notes, bookmarks, and tasks through context-heavy connections rather than traditional folder hierarchies. The aesthetic is "Industrial Revival meets Sci-Fi Terminal" — think cyberpunk command center with amber glows, CRT effects, and monospace typography.

Technology Stack
Layer	Technology
Framework	React 18 + TypeScript
Build Tool	Vite 5
Styling	Tailwind CSS + custom design system
UI Components	shadcn/ui (Radix primitives)
Routing	React Router v6
Charts	Recharts
State	Custom React hooks + localStorage
Icons	Lucide React
Target Platform	Web core → Tauri for macOS (.dmg)
Architecture Overview
src/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── AppLayout.tsx    # Main layout wrapper (sidebar + content)
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── CommandBar.tsx   # ⌘K command palette with terminal commands
│   ├── SmartInsights.tsx    # Actionable recommendations panel
│   ├── ActivityHeatmap.tsx  # 7x24 activity visualization grid
│   ├── ExpandablePanel.tsx  # Clickable panel wrapper
│   ├── FocusedPanelView.tsx # Full-screen focused panel view
│   ├── QuickCaptureBar.tsx  # Footer toolbar with popovers
│   └── ...
├── pages/
│   ├── Dashboard.tsx    # Mission Control (main view)
│   ├── Projects.tsx     # Project list
│   ├── Notes.tsx        # Notes list with markdown
│   ├── Bookmarks.tsx    # Bookmark library
│   ├── Tasks.tsx        # Kanban-style task board
│   ├── Graph.tsx        # Knowledge graph visualization
│   └── Settings.tsx     # Data export/import
├── hooks/
│   └── useStore.ts      # React hooks for data CRUD
├── lib/
│   ├── storage.ts       # localStorage persistence layer
│   ├── insightsEngine.ts    # Smart insights generation logic
│   ├── activityAnalytics.ts # Heatmap data processing
│   └── utils.ts
├── types/
│   └── index.ts         # TypeScript interfaces
└── index.css            # Design system + custom effects
Core Data Models

// src/types/index.ts

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  color: string;        // Hex color for visual identity
  deadline?: string;    // ISO date
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;      // Markdown
  projectIds: string[]; // Many-to-many
  linkedNoteIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;    // Required - tasks belong to projects
  status: 'backlog' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  projectIds: string[];
  favicon?: string;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: 'project_created' | 'note_created' | 'note_updated' | 
        'bookmark_added' | 'task_completed' | 'task_created';
  entityId: string;
  entityType: 'project' | 'note' | 'bookmark' | 'task';
  title: string;
  timestamp: string;
}
Key Design Patterns
1. Fixed Viewport Layout (No Page Scrolling)
The app is designed for macOS native feel — the entire UI fits within the viewport without scrolling. Individual panels have internal scroll areas when needed.


// AppLayout.tsx
<main className="flex-1 flex flex-col overflow-hidden">
  {/* Content fills viewport - overflow hidden at page level */}
</main>
2. URL-based Focus Mode
Dashboard panels expand to full-screen via URL query params:

/?focus=insights — Smart Insights expanded
/?focus=heatmap — Activity Heatmap expanded
/?focus=projects — Projects grid expanded
/?focus=activity — Activity log expanded
This enables browser back button navigation and deep linking.

3. Command Bar with Terminal Commands
The ⌘K command palette supports both search and terminal-style commands:

/note "My Note Title"       Create a new note
/task "Task Name" @project  Create task in project
/bookmark https://...       Save bookmark
/status                     Show system stats
/focus project-name         Focus graph on project
/help                       Show available commands
Commands stream output character-by-character for terminal feel.

4. Smart Insights Engine
src/lib/insightsEngine.ts generates actionable recommendations:

Overdue tasks — Warning with count and priority
Tasks due soon — Nudge for upcoming deadlines
Idle projects — Suggestions for projects with no activity in 7+ days
Orphaned notes — Notes without project/note links
Velocity predictions — Estimated cleanup dates based on task completion rate
Deadline warnings — Projects with approaching deadlines
5. Activity Heatmap
7x24 grid visualization showing activity density. Supports compact mode for dashboard and full mode when expanded.

Design System
Colors (Dark Theme)
Background: 220 20% 4% (near black)
Primary/Accent: 38 92% 50% (amber/gold glow)
Terminal Green: 120 60% 50%
Cyan accent: 180 70% 45%
Typography
Mono fonts: JetBrains Mono, Space Mono
Display: Bold titles with glow effects
Visual Effects (CSS in index.css)
glow-text — Text shadow glow
corner-brackets — Cyberpunk corner accent borders
crt-screen — Scanline overlay effect
grid-bg — Subtle grid background
progress-glow — Glowing progress bars
Storage Architecture
Local-first using browser localStorage with JSON serialization.


// Storage keys
myos_projects
myos_notes
myos_bookmarks
myos_tasks
myos_activities   // Capped at 50 entries
Export/Import: Full JSON export available in Settings page.

Features Implemented
Feature	Status	Notes
Dashboard (Mission Control)	✅	Two-column layout, no scroll
Click-to-expand panels	✅	URL-based focus mode
Smart Insights	✅	Actionable recommendations
Activity Heatmap	✅	7x24 grid, compact/full modes
Projects CRUD	✅	With color picker, status
Notes with Markdown	✅	Editor + preview
Bookmarks	✅	URL saving with favicon
Tasks	✅	Kanban-style, priorities
Knowledge Graph	✅	Recharts scatter visualization
Command Bar (⌘K)	✅	Search + terminal commands
Quick Capture	✅	Footer bar with popovers
Data Export/Import	✅	JSON backup in Settings
Keyboard shortcuts	✅	Escape to close panels, ⌘K
Future Considerations
Planned for Tauri Integration
Feature	Description
Native file storage	Replace localStorage with filesystem via Tauri
AppleScript integration	Sync with Apple Notes
Chrome bookmarks import	Parse bookmarks file
Menu bar app	Quick capture from system tray
Global hotkeys	System-wide ⌘K to capture
IndexedDB migration	For larger data sets
UI/UX Enhancements to Consider
Enhancement	Description
Panel zoom animation	More dramatic scale transition on expand
Stats cards expandable	Make top stats cards clickable too
Keyboard panel shortcuts	Cmd+1/2/3/4 to focus specific panels
Drag-and-drop	Reorder tasks, link notes by dragging
Full-text search	Search inside note content
Tags system	Cross-cutting categorization
Recurring tasks	Task recurrence rules
Time tracking	Optional pomodoro/time logging
Running the Project

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
Key Files to Understand
File	Purpose
src/pages/Dashboard.tsx	Main Mission Control view with focus mode
src/components/CommandBar.tsx	⌘K palette with command parsing
src/lib/insightsEngine.ts	Smart recommendations logic
src/hooks/useStore.ts	Data hooks for all entities
src/lib/storage.ts	localStorage persistence
src/index.css	Complete design system
src/types/index.ts	All TypeScript interfaces
Notes for Tauri Integration
The web app is intentionally designed to be wrapped in Tauri:

No server-side dependencies — Everything runs client-side
Fixed viewport — Designed for app window, not browser
localStorage — Easy to swap for Tauri's fs or store plugin
No external API calls — Fully offline-capable
macOS keyboard conventions — ⌘K, Escape, etc.
To wrap in Tauri:


npx create-tauri-app --template react-ts
# Copy src/ and configure vite
Handoff Summary
The myOS project is a complete, functional personal productivity app with:

A polished cyberpunk UI with attention to visual detail
Smart, actionable insights instead of just data display
Native Mac app interaction patterns (fixed viewport, panel focus)
Clean separation between data, UI, and business logic
Ready for Tauri desktop wrapping
Ready for continued development in Claude Code!