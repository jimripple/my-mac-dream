# Nothing OSINT Design Supplement

Use this file with the `nothing-design` skill when changing the Safety Intel Command Center. The skill defines the broader visual language. This supplement defines how that language applies to this specific macOS OSINT prototype.

## Required Context For AI Edits

Before making UI changes, give the AI these files:

- `docs/NOTHING_OSINT_DESIGN_SUPPLEMENT.md`
- `docs/OSINT_HANDBOOK.md`
- `src/index.css`
- `src/pages/Dashboard.tsx`
- `src/lib/intelData.ts`
- The `nothing-design` skill, if available in the AI tool

If the AI tool cannot access the `nothing-design` skill directly, use this supplement as the project-specific fallback and keep the same principles: monochrome, typographic hierarchy, dot-matrix structure, flat cards, restrained motion, and one meaningful red signal.

## Fonts

The app must load these Google Fonts in the global CSS layer:

- `Doto`: only for hero numerals or dot-matrix display moments.
- `Space Grotesk`: human-readable titles, summaries, buttons, and body text.
- `Space Mono`: uppercase labels, metadata, small metrics, source/status readouts.

Do not introduce default stacks like Inter, Roboto, Arial, or system UI as the primary visual voice. Fallbacks are fine only after the intended font.

## Product Intent

This app is a church safety intelligence command center, not a generic analytics dashboard. The UI should help an operator answer:

- What changed since the last shift?
- What is most urgent before the next event?
- Which source produced this signal?
- How confident are we?
- What is the next safe action?

Every screen should feel like an analyst workstation: calm, structured, evidence-led, and careful about uncertainty.

## Visual Rules

- Dark mode is the default product stance. Light mode must remain fully usable and intentional.
- Use OLED black background, flat raised surfaces, 1px hairline borders, and 12-16px card radius.
- Use dot grids, segmented bars, and glyph-like patterns as structure, not decoration.
- Keep the dashboard dense but readable. Prefer fewer stronger widgets over filling every gap.
- Do not use shadows, neon glow, glassmorphism, decorative gradients, emoji, cute icons, or colorful illustrations.
- Red `#D71921` is an interrupt. Use it once on the main dashboard unless showing a true critical status.
- Status colors should be applied to small values or labels only, not full card backgrounds.

## Dashboard Hierarchy

The dashboard has three layers:

- Primary: current threat posture and highest-priority record.
- Secondary: incident queue, source health, event risk, triage pipeline, and watchlist.
- Tertiary: labels, timestamps, source types, confidence, sample/prototype disclaimers.

The hero posture card should have deliberate negative space, but not an empty void. It should show the score, watch level, urgent record, and key metadata within one compact command surface.

## Click-Through Pattern

Anything that looks like a source, entity, queue item, or operational widget should open a detail view.

Detail views should include:

- A clear title and context label.
- Three compact metrics.
- Analyst readout text that explains what the operator should infer.
- Relevant records with severity, confidence, timestamp, tags, and source context.
- A next action.
- A boundary note when data is sample-only or unverified.

Avoid making detail screens feel like modal popups from a generic SaaS app. They should feel like an instrument panel sliding open from the command surface.

## OSINT Data Boundaries

V1 is sample/manual data only. Do not add scraping, surveillance, social monitoring, private-account collection, automated threat detection, or background collection without a separate design and safety review.

Every intelligence record should preserve these fields:

- `title`
- `summary`
- `severity`
- `confidence`
- `source`
- `sourceType`
- `location`
- `timestamp`
- `status`
- `tags`
- optional `url`

When live sources are eventually added, official and reputable sources come first: weather alerts, emergency management, public safety notices, traffic/road closures, CISA advisories, and local agency pages.

## Motion Rules

Use motion to imply live telemetry, not decoration.

Approved motion:

- Counting numerals on first render.
- Segmented bars filling in sequence.
- Pulsing LED dots.
- Scanline pass on card hover.
- Typewriter/ticker text for short operational messages.
- Slow sample metric drift every few seconds.

Avoid bounce, spring effects, parallax, constant shimmer, skeleton loaders, and animations that make the app feel playful or noisy.

## Component Guidance

Cards:

- Use `nd-card`.
- Keep backgrounds flat.
- Use border contrast and spacing instead of shadows.
- Make clickable cards use `nd-clickable`, keyboard focus, and `Enter`/`Space` support.

Labels:

- Use `nd-label` for uppercase metadata.
- Keep labels short: `SOURCE`, `CONFIDENCE`, `STATUS`, `WATCH`, `SAMPLE`.

Numbers:

- Use Doto only for hero posture or major display numerals.
- Use Space Mono for operational values like confidence, count, status, and timestamps.

Icons:

- Use simple 1.5px stroke icons.
- Icons support labels; they should not become decoration.

## Prompt Template For Future AI Changes

Use this when asking an AI to change the UI:

```text
You are modifying the Safety Intel Command Center macOS app. Follow the Nothing design skill and docs/NOTHING_OSINT_DESIGN_SUPPLEMENT.md. Preserve the app as a church safety OSINT prototype with sample/manual data only. Keep dark mode default and maintain light mode. Use Doto only for hero numerals, Space Grotesk for human text, and Space Mono for labels/metrics. Keep surfaces flat, monochrome, hairline-bordered, and dot-matrix structured. Do not add neon glow, shadows, glassmorphism, decorative gradients, emoji, scraping, surveillance, or automated threat detection. Anything that represents a source, record, entity, or dashboard widget should be clickable into a focused analyst detail view with metrics, readout, related records, and next action.
```

## Change Checklist

Before accepting a design change:

- The main branch was not overwritten.
- `npm run build` passes.
- The dashboard is not blank in dark or light mode.
- The hero card has a clear primary focal point.
- Clickable data cards have keyboard access.
- Red appears only where it is earned.
- No accidental OSINT network calls were introduced.
- Sample/manual data boundaries remain clear.
