

# Expandable Panels: Click-to-Focus Dashboard

## Overview

Add a Mac-native interaction pattern where clicking any Dashboard panel expands it to fill the main content area. The sidebar stays visible, and navigation back (via button, Escape key, or breadcrumb) returns to Mission Control.

---

## Interaction Flow

```text
Mission Control (default)                    Focused View
+--------+---------------------------+       +--------+---------------------------+
|        | [Stats] [Stats] [Stats]   |       |        | < Back to Mission Control |
|  SIDE  +-------------+-------------+  -->  |  SIDE  +---------------------------+
|  BAR   | Projects    | Insights    |       |  BAR   |                           |
|        |             +-------------+       |        |   SMART INSIGHTS          |
|        |             | Heatmap     |       |        |   (Full expanded view)    |
|        +-------------+-------------+       |        |                           |
|        | Quick Capture             |       |        |   All insights visible    |
+--------+---------------------------+       +--------+---------------------------+
```

---

## Implementation Approach

### Option 1: URL-based Focus (Recommended)

Use URL query params to track focused panel:
- `/` - Mission Control (all panels)
- `/?focus=insights` - Smart Insights expanded
- `/?focus=heatmap` - Activity Heatmap expanded
- `/?focus=activity` - Activity Log expanded
- `/?focus=projects` - Projects grid expanded

Benefits:
- Browser back button works naturally
- Shareable/bookmarkable focused views
- Clean separation of concerns

### Option 2: Local State

Use React state to track focus. Simpler but loses browser navigation.

Recommendation: **Option 1 (URL-based)** for Mac-like feel with browser back button support.

---

## Technical Implementation

### Dashboard State Management

```typescript
// In Dashboard.tsx
import { useSearchParams } from 'react-router-dom';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedPanel = searchParams.get('focus'); // null, 'insights', 'heatmap', 'activity', 'projects'
  
  const expandPanel = (panel: string) => {
    setSearchParams({ focus: panel });
  };
  
  const collapsePanels = () => {
    setSearchParams({});
  };
  
  // If a panel is focused, render only that panel in full view
  if (focusedPanel) {
    return <FocusedPanelView panel={focusedPanel} onBack={collapsePanels} />;
  }
  
  // Otherwise render Mission Control grid
  return <MissionControlView onExpand={expandPanel} />;
}
```

### Focused Panel View Component

```typescript
function FocusedPanelView({ 
  panel, 
  onBack 
}: { 
  panel: string; 
  onBack: () => void 
}) {
  // Handle Escape key to go back
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onBack]);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Back header */}
      <header className="flex-shrink-0 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="font-mono">Mission Control</span>
        </button>
        <h1 className="text-2xl font-bold font-display mt-2">
          {getPanelTitle(panel)}
        </h1>
      </header>

      {/* Full expanded panel content */}
      <div className="flex-1 overflow-hidden">
        {panel === 'insights' && <SmartInsights compact={false} className="h-full" />}
        {panel === 'heatmap' && <ActivityHeatmap compact={false} />}
        {panel === 'activity' && <FullActivityLog />}
        {panel === 'projects' && <FullProjectsGrid />}
      </div>
    </div>
  );
}
```

### Making Panels Clickable

Add click handlers to each panel wrapper:

```typescript
// Smart Insights panel
<div 
  onClick={() => onExpand('insights')}
  className="cursor-pointer hover:border-primary/50 transition-colors"
>
  <SmartInsights compact />
</div>

// Activity Heatmap
<div 
  onClick={() => onExpand('heatmap')}
  className="cursor-pointer hover:border-primary/50 transition-colors"
>
  <ActivityHeatmap compact />
</div>
```

### Visual Affordance

Add hover states to indicate clickability:
- Border highlight on hover
- Subtle scale transform (1.005x)
- "Expand" icon appears in corner on hover

```typescript
<div className="group relative">
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <Maximize2 className="h-4 w-4 text-muted-foreground" />
  </div>
  {/* Panel content */}
</div>
```

---

## Full-Screen Panel Content

When expanded, panels show more content:

| Panel | Compact (Dashboard) | Expanded (Full) |
|-------|---------------------|-----------------|
| Smart Insights | 3 insights, no descriptions | All insights with full descriptions |
| Activity Heatmap | 7x24 grid, minimal stats | Full grid, detailed stats, time filters |
| Activity Log | 5 items | All activities with pagination/infinite scroll |
| Projects | 6 cards in 2x3 grid | All projects in larger grid with more detail |

---

## New Components Needed

| Component | Purpose |
|-----------|---------|
| `FocusedPanelView` | Wrapper for expanded panel with back navigation |
| `FullActivityLog` | Expanded activity log with all items |
| `FullProjectsGrid` | Expanded projects view |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add URL-based focus state, conditional rendering |
| `src/components/SmartInsights.tsx` | Accept `onClick` prop, add hover states |
| `src/components/ActivityHeatmap.tsx` | Accept `onClick` prop, add hover states |
| `src/components/ExpandablePanel.tsx` | New wrapper component for clickable panels |

---

## Keyboard Support

- **Click** on panel: Expand to full view
- **Escape**: Return to Mission Control
- **Cmd+[** or Browser Back: Return to Mission Control

---

## Animation

Add smooth transition when expanding/collapsing:

```css
.panel-expand {
  animation: panel-zoom 0.2s ease-out;
}

@keyframes panel-zoom {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Result

After implementation:
- Click any panel on Dashboard to expand it full-screen (sidebar stays)
- Press Escape or click "Back to Mission Control" to return
- Browser back button works naturally
- Panels show expand icon on hover
- Smooth animations between states
- Feels like a native Mac app with focus modes

