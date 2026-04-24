# Pre-Release Audit Checklist

Use this before handing the app to another developer, AI assistant, or church safety stakeholder. The goal is not to certify the product. The goal is to prevent obvious mistakes before adding real data sources.

## Security Audit

- Run `npm audit` and review dependency advisories before shipping builds.
- Run `npm run build` after every meaningful UI or data-flow change.
- Review Tauri permissions before enabling filesystem, network, shell, notification, location, or background capabilities.
- Keep API keys out of the repo. Use local config or environment storage.
- Add live source integrations one at a time with explicit domain allowlists.
- Avoid broad network access until the source directory and refresh rules are defined.
- Do not store sensitive reports in plaintext if the app later persists real safety records.
- Add a data deletion/export story before storing operational records beyond local sample data.

## OSINT Safety Audit

- Confirm every source is public, official, reputable, or manually provided by the safety team.
- Record source, timestamp, confidence, location, and analyst notes for every intelligence item.
- Treat social/community posts as unverified leads, not facts.
- Do not collect irrelevant personal information.
- Do not scrape private accounts, bypass access controls, impersonate people, or automate collection where prohibited.
- Do not add facial recognition, license plate tracking, personal surveillance, or automated threat scoring without legal, ethical, and leadership review.
- Add an escalation path for credible threats: local law enforcement, county emergency management, or the appropriate fusion center.

## Design Audit

- Verify dark mode and light mode both work.
- Check that Doto is only used for hero/display numerals.
- Check that Space Grotesk and Space Mono remain the primary app fonts.
- Confirm red is used only as an earned signal, not a general accent.
- Keep cards flat: no shadows, glow, glassmorphism, decorative gradients, or emoji.
- Make source, entity, incident, and operational widgets clickable into analyst detail views.
- Confirm clickable surfaces support keyboard activation and visible focus.
- Respect `prefers-reduced-motion`.
- Confirm animations clarify transitions and do not make the interface feel playful or noisy.

## Product Readiness Audit

- Verify the app still clearly says it is sample/manual data only.
- Verify no accidental live OSINT network calls were introduced.
- Verify manual intake behavior is clear: draft-only until persistence is implemented.
- Verify the README build order still matches the real roadmap.
- Rebuild the macOS app with `npm run tauri:build`.
- Open the built `.app` from `src-tauri/target/release/bundle/macos/` and inspect the actual native build, not only the browser dev server.
