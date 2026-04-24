# Safety Intel Command Center

This branch is a macOS/Tauri prototype for a church safety OSINT command center. It is dark-first, Nothing-inspired, and currently uses local sample/manual intelligence records only. It does not scrape, monitor social platforms, or run live collectors.

## Start Here

If you are handing this project to an AI assistant, give it these files first:

1. `README.md`
2. `docs/NOTHING_OSINT_DESIGN_SUPPLEMENT.md`
3. `docs/OSINT_HANDBOOK.md`
4. `docs/PRE_RELEASE_AUDIT_CHECKLIST.md`
5. `src/index.css`
6. `src/pages/Dashboard.tsx`
7. `src/lib/intelData.ts`

If your AI tool has access to the `nothing-design` skill, tell it to use that skill with the supplemental design file. If it does not, `docs/NOTHING_OSINT_DESIGN_SUPPLEMENT.md` contains the project-specific rules it should follow.

Use this prompt:

```text
You are working on the Safety Intel Command Center, a macOS/Tauri app for church safety OSINT triage. Read README.md, docs/NOTHING_OSINT_DESIGN_SUPPLEMENT.md, and docs/OSINT_HANDBOOK.md before changing code. Preserve the Nothing-inspired design system, dark-first/light-capable theme, sample/manual data boundary, and analyst workflow. Build in the priority order listed in README.md. Do not add scraping, surveillance, private-account collection, automated threat scoring, or background location tracking.
```

## Best Next Steps

Build the project in this order so it becomes useful without becoming risky or overbuilt.

1. Campus location setup: let the operator enter the church address or latitude/longitude, choose a watch radius, and derive county/state/ZIP for source filtering. Prefer fixed campus location over live user tracking.
2. Persistent manual intake: turn the visual intake box into saved local records with title, summary, location, severity, confidence, source, status, tags, and analyst notes.
3. Source directory: add configurable official links for county emergency management, city notices, police/sheriff public information, fire department, public works, school district, DOT/511, utility outage maps, and church-critical vendor status pages.
4. NWS weather integration: pull active weather alerts and forecast data for the configured campus point using the National Weather Service API.
5. Event briefing generator: create operator briefs for `next 24 hours`, `Sunday service`, `youth night`, and `open elevated items`.
6. Traffic and road conditions: add state DOT or 511 feeds when available for arrival/dismissal routes and nearby closures.
7. Environmental feeds: add AirNow air quality and local environmental alerts if outdoor events, heat, smoke, or air quality matter locally.
8. Cyber and infrastructure awareness: add CISA alerts, CISA KEV references, and vendor status pages for cameras, access control, internet, website, payment, and church management systems.
9. FEMA IPAWS: add all-hazards CAP alerts only after access is approved and refresh/rate-limit behavior is designed correctly.
10. Social/open-web monitoring: consider last, only with written source rules, privacy boundaries, and leadership approval.

## Safety Boundaries

- Use official and reputable public sources first.
- Treat community tips and social posts as unverified leads.
- Keep records focused on church safety operations.
- Do not collect irrelevant personal information.
- Do not impersonate, bypass access controls, scrape private accounts, or automate against sources that prohibit it.
- Escalate credible threats to the appropriate local authority instead of trying to investigate beyond the team role.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:8080/`.

## Build the Mac app

```sh
npm run tauri:build
```

The macOS bundle is produced under `src-tauri/target/release/bundle/`.

## Handoff

Read [NOTHING_OSINT_DESIGN_SUPPLEMENT.md](./docs/NOTHING_OSINT_DESIGN_SUPPLEMENT.md) for design rules and AI prompting guidance. Read [OSINT_HANDBOOK.md](./docs/OSINT_HANDBOOK.md) for analyst framing, location-aware setup, source possibilities, and data-source priorities. Use [PRE_RELEASE_AUDIT_CHECKLIST.md](./docs/PRE_RELEASE_AUDIT_CHECKLIST.md) before adding real sources or handing the app to another builder.

## Stack

This project is built with:

- Vite
- TypeScript
- React
- Tailwind CSS
- Tauri 2
