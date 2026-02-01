

# Mac App Layout Redesign: Fixed Viewport Dashboard

## Problem

The current Dashboard stacks 6 sections vertically, requiring scrolling. This feels like a website, not a native Mac app. Mac apps typically:

- Fill the viewport without scrolling
- Use panels/columns that resize
- Show secondary content in overlays, popovers, or collapsible areas
- Use the sidebar for navigation, not content overflow

---

## Proposed Solution

Redesign the Dashboard to fit everything visible in a fixed viewport using a **panel-based layout** with smart content placement.

---

## New Layout Structure

```text
+--------+--------------------------------------------------+
|        |  HEADER: Mission Control + Date + Status        |
|        +----------------------+---------------------------+
|        |                      |                           |
|  SIDE  |   MAIN PANEL         |   RIGHT PANEL             |
|  BAR   |                      |                           |
|        |   - Stats (compact)  |   - Smart Insights        |
|        |   - Projects Grid    |   - Activity Heatmap      |
|        |                      |     (compact)             |
|        |                      |   - Activity Log          |
|        +----------------------+---------------------------+
|        |  FOOTER: Quick Capture (collapsed bar)           |
+--------+--------------------------------------------------+
```

---

## Key Changes

### 1. Two-Column Main Content

Split the content area into two columns:
- **Left (60%):** Stats + Active Projects
- **Right (40%):** Insights + Heatmap + Activity Log

Both columns use `flex-1` and fill the available height without overflow.

### 2. Compact Activity Heatmap

Currently ~280px tall. Reduce to ~140px:
- Shrink cell height from 24px to 16px
- Move legend/stats into a single row
- Optional: Collapse to just "System Pulse: Active" bar, expand on click

### 3. Quick Capture as Footer Bar

Instead of a large panel at the bottom:
- Show a thin bar: `[ + Quick Note ] [ + Bookmark ] [ + Task ]`
- Clicking opens a **popover** or **modal** above the bar
- When collapsed, takes only ~48px

### 4. Smart Insights as Scrollable Panel (Within Fixed Height)

If there are many insights:
- Limit the panel to 2-3 visible insights
- Add internal scroll for more
- The page itself doesn't scroll - just this one panel

### 5. Activity Log Condensed

- Show 5 items instead of 8
- Smaller text, tighter spacing
- "View All" opens a full activity page or modal

---

## Implementation Details

### AppLayout Changes

```tsx
// Remove overflow-auto from main
<main className="flex-1 flex flex-col overflow-hidden">
  {/* Content fills viewport without scrolling */}
</main>
```

### Dashboard Layout

```tsx
<div className="h-full flex flex-col p-6">
  {/* Header - fixed height */}
  <header className="flex-shrink-0 mb-4">...</header>
  
  {/* Main content - fills remaining space */}
  <div className="flex-1 flex gap-6 overflow-hidden">
    {/* Left column */}
    <div className="flex-[6] flex flex-col gap-4 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">Stats...</div>
      <div className="flex-1 overflow-hidden">Projects Grid</div>
    </div>
    
    {/* Right column */}
    <div className="flex-[4] flex flex-col gap-4 overflow-hidden">
      <SmartInsights className="flex-shrink-0 max-h-[200px]" />
      <ActivityHeatmap compact />
      <ActivityLog compact className="flex-1" />
    </div>
  </div>
  
  {/* Footer - Quick Capture bar */}
  <QuickCaptureBar className="flex-shrink-0 mt-4" />
</div>
```

### Quick Capture Redesign

Convert from full panel to toolbar with popovers:

```tsx
<div className="h-12 bg-card border border-border flex items-center gap-2 px-4">
  <span className="text-xs font-mono text-muted-foreground">QUICK:</span>
  <PopoverTrigger>
    <Button size="sm">+ Note</Button>
  </PopoverTrigger>
  <PopoverTrigger>
    <Button size="sm">+ Bookmark</Button>
  </PopoverTrigger>
  <PopoverTrigger>
    <Button size="sm">+ Task</Button>
  </PopoverTrigger>
</div>
```

### Activity Heatmap Compact Mode

Add a `compact` prop:

```tsx
<ActivityHeatmap compact />
// When compact:
// - Cell height: 16px instead of 24px
// - 7 rows still, but tighter
// - Stats inline with legend
// - Total height: ~120px instead of ~280px
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/AppLayout.tsx` | Remove `overflow-auto` from main |
| `src/pages/Dashboard.tsx` | Two-column flexbox layout, no scroll |
| `src/components/QuickCapture.tsx` | Convert to toolbar with popovers |
| `src/components/ActivityHeatmap.tsx` | Add `compact` prop for smaller display |
| `src/components/SmartInsights.tsx` | Add max-height with internal scroll |

---

## Visual Result

After changes, the Dashboard will:
- Fill the window exactly - no page scroll
- Show all key information at a glance
- Use popovers for input forms (Quick Capture)
- Feel like Xcode, Raycast, or other Mac productivity apps
- Still look great at different window sizes (flex-based layout)

---

## Responsive Behavior

For smaller windows:
- Columns stack if window is narrow
- Heatmap can collapse further or hide
- Minimum viable size maintained

For larger windows:
- Content expands proportionally
- Project cards can show more detail
- More insights visible

