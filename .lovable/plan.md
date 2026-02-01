

# myOS Feature Implementation Plan

## Overview

This plan adds 5 core features plus smart relationship suggestions to make myOS a genuinely useful personal command center. All features work together to reduce friction and surface meaningful connections.

---

## Features Summary

| Feature | Purpose |
|---------|---------|
| **1. Project Detail View** | See everything connected to a project in one place |
| **2. Quick Capture** | Add notes/bookmarks/tasks without leaving the dashboard |
| **3. Universal Search** | Find anything by typing keywords |
| **4. Markdown Editor** | Rich note editing with formatting toolbar |
| **5. Data Export/Import** | Backup and restore all your data |
| **6. Smart Suggestions** | Automatic hints when new items may relate to existing projects |

---

## Feature 1: Project Detail View

**What it does:** When you click on a project, see all its connected notes, bookmarks, and tasks in one unified view with progress visualization.

**New page:** `/projects/:id`

**Sections:**
- Project header with name, description, status, deadline, and color
- Progress gauge (circular) based on task completion
- Tabbed content area:
  - **Tasks tab** - All tasks for this project with inline status toggle
  - **Notes tab** - All notes linked to this project
  - **Bookmarks tab** - All bookmarks linked to this project
- Quick-add buttons for each content type
- Edit/Delete project actions

---

## Feature 2: Quick Capture

**What it does:** Add content directly from the dashboard without navigating to separate pages.

**Implementation:**
- Expand the existing Quick_Capture section on Dashboard
- Add inline forms that expand when clicked:
  - **Quick Note** - Title + content textarea, auto-link to selected project
  - **Quick Bookmark** - URL input with auto-title detection
  - **Quick Task** - Title + project selector (already partially exists in Tasks page)
- Forms collapse after submission with success feedback

---

## Feature 3: Universal Search

**What it does:** Find any note, bookmark, task, or project by typing keywords. Works from Command Bar (Cmd+K).

**Implementation:**
- Enhance existing CommandBar to search across all content types
- Search indexes: project names/descriptions, note titles/content, bookmark titles/URLs/descriptions, task titles
- Show results grouped by type with item previews
- Click result to navigate directly to the item
- Keyboard navigation through results

---

## Feature 4: Markdown Editor

**What it does:** Proper note editing with formatting support.

**Implementation:**
- Create a new NoteEditor component with:
  - Formatting toolbar (bold, italic, headers, lists, code, links)
  - Live preview toggle (side-by-side or tabbed)
  - Keyboard shortcuts (Cmd+B for bold, etc.)
- Create a Note Detail/Edit page (`/notes/:id`)
- Add note-to-note linking via `[[note title]]` syntax
- Parse and render markdown with proper styling

---

## Feature 5: Data Export/Import

**What it does:** Download all your data as JSON, restore from backup.

**Implementation:**
- Add Settings page (`/settings`) with:
  - **Export** button - Downloads JSON file with timestamp
  - **Import** section - File upload with validation and confirmation
  - Storage stats (item counts, approximate storage used)
- Format: Single JSON with projects, notes, bookmarks, tasks, activities

---

## Feature 6: Smart Relationship Suggestions

**What it does:** When creating/editing items, the system suggests related projects based on keyword matching.

**How it works (no AI required):**
1. Extract keywords from the new item's title/content
2. Compare against existing project names and descriptions
3. Score matches based on:
   - Exact word matches
   - Partial word matches
   - Number of overlapping terms
4. Surface top 3 suggestions with confidence indicators

**UI Pattern:**
- When typing in title/description fields, show a "Related Projects" panel
- Display suggested projects with match reasoning (e.g., "Contains: api, backend")
- One-click to add connection
- Dismiss button to ignore suggestions

**Where it appears:**
- New Note form
- New Bookmark form
- New Project form (suggests related existing projects)
- Note/Bookmark edit forms

---

## Implementation Order

```text
Phase 1: Foundation
  1. Project Detail View - core navigation improvement
  2. Note Detail/Edit View - enables proper editing

Phase 2: Capture Flow
  3. Quick Capture - reduces friction for adding content
  4. Markdown Editor - makes notes actually usable

Phase 3: Discovery
  5. Universal Search - find anything instantly
  6. Smart Suggestions - surface hidden connections

Phase 4: Safety
  7. Data Export/Import - protect user data
```

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/ProjectDetail.tsx` | Project view with connected items |
| `src/pages/NoteDetail.tsx` | Note view/edit with markdown |
| `src/pages/Settings.tsx` | Export/import and app settings |
| `src/components/QuickCapture.tsx` | Inline capture forms for dashboard |
| `src/components/MarkdownEditor.tsx` | Formatting toolbar + editor |
| `src/components/MarkdownPreview.tsx` | Render markdown content |
| `src/components/RelatedSuggestions.tsx` | Smart project suggestions panel |
| `src/lib/suggestions.ts` | Keyword extraction and matching logic |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for ProjectDetail, NoteDetail, Settings |
| `src/pages/Dashboard.tsx` | Replace Quick_Capture with QuickCapture component |
| `src/components/CommandBar.tsx` | Add full-text search across all items |
| `src/components/Sidebar.tsx` | Add Settings link |
| `src/pages/NewNote.tsx` | Add RelatedSuggestions panel |
| `src/pages/NewBookmark.tsx` | Add RelatedSuggestions panel |
| `src/pages/NewProject.tsx` | Add RelatedSuggestions panel |

---

## Technical Details

### Keyword Matching Algorithm

```text
extractKeywords(text):
  1. Lowercase and split by whitespace/punctuation
  2. Remove common stopwords (the, a, is, to, etc.)
  3. Remove words under 3 characters
  4. Return unique keyword set

scoreMatch(itemKeywords, projectKeywords):
  - Count overlapping keywords
  - Weight by keyword length (longer = more specific)
  - Normalize by total keywords
  - Return score 0-100

suggestProjects(newItem, allProjects):
  1. Extract keywords from newItem
  2. For each project, calculate match score
  3. Filter scores above threshold (e.g., 20)
  4. Return top 3 sorted by score
```

### Markdown Support

Using simple regex-based parsing for:
- **Bold** (`**text**`)
- *Italic* (`*text*`)
- Headers (`# ## ###`)
- Lists (`- item` or `1. item`)
- Code blocks (triple backticks)
- Links (`[text](url)`)
- Note links (`[[Note Title]]` - internal linking)

---

## Summary

This plan transforms myOS from a visually interesting demo into a functional personal command center. The features build on each other:

1. **Project Detail View** gives context to your work
2. **Quick Capture** reduces friction to near-zero
3. **Universal Search** makes finding things instant
4. **Markdown Editor** makes notes worth writing
5. **Data Export** protects your investment
6. **Smart Suggestions** surfaces connections you might miss

All without requiring any external AI service.

