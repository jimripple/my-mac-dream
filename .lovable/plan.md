

# Cyberpunk Enhancement Plan: Activity Heatmap, Neural Link Graph, and Terminal Quick-Actions

## Overview

This plan implements three features from the Gemini suggestions that lean into the cyberpunk terminal aesthetic while adding genuine utility:

| Feature | Purpose |
|---------|---------|
| **1. Ghost in the Machine - Activity Heatmap** | Visualize your productivity rhythm as a real-time "system pulse" |
| **2. Neural Link - Project Contextualizer** | Focus the Graph view on a selected project with glitch transitions |
| **3. Terminal Quick-Actions** | Natural language commands in the Command Bar with streaming output |

---

## Feature 1: Ghost in the Machine - Activity Heatmap

### What It Does

A real-time visualization showing your "system load" - when you're most active based on task completions, notes created, and bookmarks added. Instead of a static GitHub-style grid, this shows a vertical waterfall that "pings" with each action.

### Visual Design

```text
SYSTEM_PULSE
+------------------------------------------+
|  ▓▓▓▓▓▓▓▓░░░░░░░░▓▓▓▓▓▓░░░░░░░░░░░░░░  | TODAY
|  ▓▓▓▓░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░▓▓░░░░  | -1D
|  ░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  | -2D
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  | -3D
|  ░░░░░░░░▓▓▓▓░░░░░░░░▓▓▓▓░░░░░░░░░░░░  | -4D
|  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓  | -5D
|  ░░░░░░▓▓▓▓▓▓▓▓░░░░░░░░░░▓▓▓▓░░░░░░░░  | -6D
+------------------------------------------+
  AM  06  08  10  12  14  16  18  20  PM

  ACTIVITY DENSITY: ▓▓▓▓░░ HIGH  ░░░░░░ LOW
  TODAY: 12 actions | PEAK: 2:00 PM | STREAK: 5 days
```

### Technical Implementation

**Data Source:** Uses existing `activities` array from storage (timestamps available)

**Processing Logic:**
1. Group activities by hour-of-day and day-of-week for past 7 days
2. Calculate density per time slot (0-23 hours)
3. Normalize to intensity levels (0-4 for visual blocks)

**New Component:** `src/components/ActivityHeatmap.tsx`
- Renders a 7-row (days) x 24-column (hours) grid
- Each cell colored by activity density (darker = more active)
- Hover shows exact count and activity breakdown
- "Ping" animation when new activity is added
- Stats bar: total today, peak hour, streak days

**Placement:** Dashboard, below the stats grid (replace or augment Activity Log)

### Visual Effects

- Cells glow with primary amber color based on intensity
- New activities trigger a ripple/ping animation
- Subtle scan-line overlay for CRT aesthetic
- Monospace labels with uppercase formatting

---

## Feature 2: Neural Link - Project Contextualizer

### What It Does

When you click a project (anywhere in the app), the Graph view can focus on that project's connections. Selecting a project shows only its connected notes, bookmarks, and tasks - with a glitch transition effect as nodes "digitize" into the new configuration.

### Current State

The Graph page (`/graph`) shows ALL nodes in a scatter plot. Projects, notes, and bookmarks are positioned radially but there's no filtering or focus capability.

### Implementation Approach

**Option A: Project Selector on Graph Page**
- Add a dropdown/selector at the top of Graph page
- Selecting a project filters to show only connected items
- "Show All" option returns to full view

**Option B: Deep Link from Project Detail**
- Add "View in Graph" button on ProjectDetail page
- Navigate to `/graph?focus=projectId`
- Graph page reads query param and filters

**Recommended:** Implement both - selector on page + deep link from project

### Technical Changes

**Modify:** `src/pages/Graph.tsx`

1. Add state for `focusedProjectId`
2. Add project selector dropdown
3. Filter `graphData` when project is focused:
   - Include the project node
   - Include notes where `projectIds` contains the project
   - Include bookmarks where `projectIds` contains the project
   - Include tasks where `projectId` matches
4. Recalculate positions for filtered subset

**Glitch Transition Effect:**

New CSS animation in `index.css`:
```css
@keyframes node-digitize {
  0% { opacity: 1; transform: scale(1); }
  20% { opacity: 0.5; transform: scale(0.9) translateX(2px); }
  40% { opacity: 0.3; transform: scale(0.95) translateX(-2px); }
  60% { opacity: 0.7; transform: scale(1.05); filter: hue-rotate(20deg); }
  80% { opacity: 0.9; transform: scale(0.98); }
  100% { opacity: 1; transform: scale(1); }
}

.node-transition {
  animation: node-digitize 0.4s ease-out;
}
```

When switching focus, add the animation class to the chart container for 400ms.

### UI Elements

- Project dropdown with color indicator for each project
- "FOCUS: [Project Name]" indicator when filtered
- "Clear Focus" button to show all
- Node count: "Showing 8 of 47 nodes"

---

## Feature 3: Integrated Terminal Quick-Actions

### What It Does

The Command Bar (Cmd+K) becomes a true terminal - supporting natural language commands and custom shortcuts that execute actions immediately with streaming text output.

### Command Syntax

```text
/note "Meeting notes from standup"     -> Creates a quick note
/task "Fix login bug" @project-name    -> Creates task linked to project  
/bookmark https://example.com          -> Adds bookmark with auto-title
/log "Finished the API integration"    -> Logs activity entry
/track "Research cyberpunk UI"         -> Creates note + starts timer (future)
/status                                -> Shows system stats
/focus project-name                    -> Opens project in Graph view
```

### Technical Implementation

**Modify:** `src/components/CommandBar.tsx`

1. Detect when input starts with `/`
2. Parse command and arguments
3. Execute appropriate action
4. Show streaming output in the command list area

**Command Parser:**
```typescript
interface ParsedCommand {
  command: string;        // 'note', 'task', 'bookmark', etc.
  args: string[];         // Parsed arguments
  projectRef?: string;    // @project-name reference
}

function parseCommand(input: string): ParsedCommand | null {
  if (!input.startsWith('/')) return null;
  // Parse /command "content" @project format
  const match = input.match(/^\/(\w+)\s*(?:"([^"]+)")?\s*(?:@([\w-]+))?/);
  if (!match) return null;
  return {
    command: match[1],
    args: match[2] ? [match[2]] : [],
    projectRef: match[3]
  };
}
```

**Streaming Output Effect:**

When a command executes, show output character-by-character:

```typescript
const streamOutput = async (text: string, onChar: (char: string) => void) => {
  for (const char of text) {
    onChar(char);
    await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
  }
};
```

### UI Changes

- Input shows command syntax highlighting (/ in green, args in cyan)
- Output area below input for streaming results
- Success: green text with checkmark
- Error: red text with description
- Help: `/help` shows available commands

### Command List (Phase 1)

| Command | Action |
|---------|--------|
| `/note "title"` | Create note with title (opens editor) |
| `/task "title" @project` | Create task linked to project |
| `/bookmark url` | Add bookmark (auto-fetches title) |
| `/log "message"` | Add activity log entry |
| `/status` | Show system stats (projects, notes, tasks) |
| `/focus project` | Focus Graph on project |
| `/help` | Show command list |

---

## Implementation Order

```text
Phase 1: Activity Heatmap
  - Create ActivityHeatmap component
  - Add to Dashboard
  - Add CSS animations for ping effect

Phase 2: Neural Link Graph
  - Add project selector to Graph page
  - Implement filtering logic
  - Add glitch transition CSS
  - Add deep link from ProjectDetail

Phase 3: Terminal Commands
  - Add command parser to CommandBar
  - Implement base commands (/note, /task, /bookmark)
  - Add streaming output effect
  - Add /status and /help commands
```

---

## New Files

| File | Purpose |
|------|---------|
| `src/components/ActivityHeatmap.tsx` | 7-day activity visualization |
| `src/lib/activityAnalytics.ts` | Functions to process activity data for heatmap |

## Modified Files

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add ActivityHeatmap component |
| `src/pages/Graph.tsx` | Add project focus filtering and glitch transitions |
| `src/components/CommandBar.tsx` | Add command parsing and streaming output |
| `src/index.css` | Add glitch animation keyframes |
| `src/pages/ProjectDetail.tsx` | Add "View in Graph" button |

---

## Technical Details

### Activity Analytics

```typescript
// src/lib/activityAnalytics.ts

interface HeatmapCell {
  day: number;      // 0-6 (days ago)
  hour: number;     // 0-23
  count: number;
  intensity: number; // 0-4 normalized
}

function generateHeatmapData(activities: Activity[]): HeatmapCell[] {
  const now = new Date();
  const cells: HeatmapCell[] = [];
  
  // Initialize 7x24 grid
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      cells.push({ day, hour, count: 0, intensity: 0 });
    }
  }
  
  // Count activities per cell
  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      const hour = date.getHours();
      const cell = cells.find(c => c.day === daysAgo && c.hour === hour);
      if (cell) cell.count++;
    }
  });
  
  // Normalize to intensity (0-4)
  const maxCount = Math.max(...cells.map(c => c.count), 1);
  cells.forEach(cell => {
    cell.intensity = Math.round((cell.count / maxCount) * 4);
  });
  
  return cells;
}
```

### Graph Focus Filter

```typescript
// In Graph.tsx

const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

const filteredGraphData = useMemo(() => {
  if (!focusedProjectId) return graphData; // Show all
  
  const project = projects.find(p => p.id === focusedProjectId);
  if (!project) return graphData;
  
  const filteredNotes = notes.filter(n => n.projectIds.includes(focusedProjectId));
  const filteredBookmarks = bookmarks.filter(b => b.projectIds.includes(focusedProjectId));
  
  // Rebuild nodes array with only connected items
  // Recalculate positions for smaller set
}, [focusedProjectId, graphData, projects, notes, bookmarks]);
```

---

## Summary

These three features push myOS deeper into the cyberpunk terminal aesthetic while adding real functionality:

1. **Activity Heatmap** - See your productivity patterns at a glance
2. **Neural Link Graph** - Focus on one project's connections with visual flair
3. **Terminal Commands** - Power-user shortcuts with satisfying feedback

All three build on existing data structures and enhance the "command center" feel without requiring external services.

