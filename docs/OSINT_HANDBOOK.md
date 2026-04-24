# Safety Intel Command Center Handoff

This prototype should think like an intelligence analyst, not like a generic dashboard. The job is to help a church safety team collect public, reputable signals, assess them with discipline, and turn them into calm decisions.

## Analyst Frame

Start every collection effort with a question. Good priority intelligence requirements for this product:

- Are there credible threats that could affect services, school/youth events, staff, volunteers, or visitors?
- Are there weather, road, emergency, or public safety conditions that could disrupt arrival, dismissal, parking, or evacuation?
- Are there recurring weak signals around a location, person, event, or keyword that deserve human review?
- What changed since the last shift, and what requires action before the next event?

Every item should carry source, timestamp, location, confidence, severity, status, and analyst notes. Never treat raw collection as truth. Prefer official/public records first, then corroborate with a second source when possible.

## Ideal Capabilities

- Manual intake for volunteer observations, phone calls, staff reports, and suspicious activity notes.
- Geofenced public alert collection for the church campus and nearby routes.
- Weather, traffic, and emergency event monitoring for service windows and special events.
- Source health tracking so operators know what is fresh, stale, manual, or unavailable.
- Entity/watchlist tracking for places, events, organizations, keywords, and recurring patterns.
- Triage workflow with statuses like `new`, `triaging`, `monitoring`, `escalated`, and `closed`.
- Confidence scoring that separates "reported", "corroborated", and "confirmed".
- Exportable briefings for the safety lead before services or major events.
- Clear legal/ethical boundaries: public sources, official feeds, manual reports, no impersonation, no bypassing access controls, no private account scraping.

## Reputable Source Roadmap

## Location-Aware Setup

The app should eventually support an optional location setup flow so it can pull the right local information without asking the operator to configure every feed manually.

Recommended V1 approach:

- Ask for the church campus address or latitude/longitude during setup.
- Let the operator choose a watch radius, such as 1 mile, 5 miles, 15 miles, and county-wide.
- Derive county, state, ZIP code, nearby roads, and weather forecast zone from that location.
- Store the campus location as configuration, not as a live tracking feature.
- Offer a separate optional "use my current location" button for mobile/laptop travel workflows, with clear consent and a manual fallback.
- Show exactly which feeds use location and when each feed last refreshed.

Privacy boundary:

- Prefer a fixed campus location over continuous user tracking.
- Do not store staff, volunteer, or attendee live locations.
- Do not collect background location unless a future version has a clear operational reason, visible controls, and explicit consent.
- Keep all location-derived alerts tied to safety use cases: weather, road conditions, official emergency alerts, event logistics, and facility access.

Location makes these features much more useful:

- Active weather alerts for the campus point.
- Forecast and hourly conditions for service windows.
- County emergency alerts and public safety notices.
- Traffic incidents and road closures near arrival/dismissal routes.
- Air quality, smoke, heat, or environmental concerns for outdoor events.
- Nearby earthquake, flood, wildfire, or severe storm context when relevant.
- Automatic source suggestions for city, county, sheriff, fire, emergency management, school district, and state DOT pages.

## Data Source Possibilities

Treat this as a source menu, not a mandate. Add the highest-signal official sources first, then add noisier sources only after the workflow is proven.

### Weather And Environmental

- National Weather Service API: forecasts, hourly forecasts, observations, and active alerts by point, zone, county, or state. Best first live integration for this app.
- NWS CAP / alerts feed: useful for watches, warnings, advisories, urgency, severity, certainty, effective time, expiration, and affected area.
- AirNow API: air quality observations and forecasts for smoke, ozone, particulate matter, and outdoor event decisions. Requires an API account/key.
- USGS Earthquake GeoJSON feeds: recent earthquakes, significance, location, magnitude, and timestamps.
- Local flood gauges, river forecasts, wildfire dashboards, and state environmental feeds where relevant.

### Emergency And Public Safety

- FEMA IPAWS All-Hazards Information Feed: official CAP-format public emergency alerts, including weather and non-weather alerts. Access requires registration / approval and should be implemented later, not first.
- DHS National Terrorism Advisory System XML feed: current national terrorism advisories. Low volume, useful for context rather than local operations.
- County emergency management alerts: usually the best local all-hazards source if the county publishes RSS, email archives, Everbridge/Nixle pages, or public web alerts.
- City police/fire/sheriff public information pages: use official pages and press releases, not scanner scraping.
- Fusion center contact information: use for escalation pathways and official guidance, not automated collection unless a feed is explicitly offered.

### Transportation And Event Logistics

- State DOT / 511 feeds: road closures, incidents, construction, winter road conditions, and planned events. Availability varies by state or region.
- Local public works pages: road closures, water main breaks, utility work, parking restrictions, and parade/special-event notices.
- School district and municipality calendars: nearby events that can affect traffic, parking, or crowd flow.
- Public transit service alerts where the church depends on bus, rail, or paratransit access.

### Cyber And Infrastructure

- CISA alerts and advisories: cybersecurity/infrastructure issues that could affect cameras, access control, church Wi-Fi, websites, payment systems, or vendors.
- CISA Known Exploited Vulnerabilities catalog: useful if the church tracks exposed software, network gear, cameras, NAS devices, or vendor-managed systems.
- Vendor status pages for church-critical services: alarm provider, camera provider, access control, website host, payment processor, church management platform, email, and internet provider.
- Local utility outage maps: power, gas, water, and internet availability near the campus.

### Manual And Human Sources

- Volunteer observations.
- Staff reports.
- Facilities issues.
- Parking team notes.
- Security team shift logs.
- Parent/student ministry reports.
- Calls, emails, and tips that are manually entered by an operator.

Manual records should always include who entered the record, when it was entered, the observed location, confidence, and whether it has been corroborated.

### Sources To Treat Carefully

- Social media posts, forums, and neighborhood apps are unverified leads, not facts.
- Avoid collecting private account content, protected-class information, irrelevant personal details, or anything obtained by impersonation or bypassing access controls.
- Do not automate collection from a platform unless the terms and source rules allow it.
- Do not build facial recognition, license plate tracking, personal surveillance, or automated threat scoring without legal, ethical, and leadership review.

## Suggested Integration Priority

1. Campus location setup: address, lat/lon, county, state, ZIP, radius, and event windows.
2. Manual intake persistence: make human observations real records.
3. NWS point forecast and active alerts.
4. Local official links directory: county EMA, city, sheriff/police, fire, public works, school district, DOT/511, utility outage maps.
5. Briefing generator: "next 24 hours", "Sunday service", "youth night", and "open elevated items".
6. AirNow and environmental feeds if outdoor events, smoke, heat, or air quality matter locally.
7. DOT/511 traffic incidents and planned road closures for arrival/dismissal routes.
8. CISA alerts, KEV, and vendor status pages for infrastructure/cyber awareness.
9. FEMA IPAWS after access is approved and refresh/rate-limit behavior is designed correctly.
10. Social/open-web monitoring only after written source rules, privacy boundaries, and escalation procedures exist.

## Reputable Source Roadmap

Use official sources first:

- National Weather Service API: watches, warnings, advisories, forecasts, and observations. Docs: https://www.weather.gov/documentation/services-web-api and alerts: https://www.weather.gov/documentation/services-web-alerts
- FEMA IPAWS All-Hazards Information Feed: official public emergency alerts in CAP format; access requires registration/request. Docs: https://www.fema.gov/emergency-managers/practitioners/integrated-public-alert-warning-system/technology-developers/all-hazards-information-feed
- DHS National Terrorism Advisory System: federal terrorism advisories and bulletins. Source: https://www.dhs.gov/national-terrorism-advisory-system
- DHS Fusion Centers: state/local information-sharing hubs and contact points. Source: https://www.dhs.gov/fusion-centers and contacts: https://www.dhs.gov/fusion-center-locations-and-contact-information
- CISA Alerts and Advisories: cyber and infrastructure advisories relevant to church networks, cameras, access systems, and vendors. Source: https://www.cisa.gov/ncas/alerts
- CISA Known Exploited Vulnerabilities: prioritize cyber remediation when the church has exposed software or vendor systems. Source: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- FBI Crime Data Explorer / UCR: background trend data, not live incident alerts. Source: https://www.fbi.gov/services/cjis/ucr/
- AirNow API: air quality observations and forecasts. Requires an account/API key. Source: https://docs.airnowapi.org/about
- USGS Earthquake GeoJSON feeds: recent earthquake data for situational awareness. Source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- Local official sources: county emergency management, city public works, sheriff/police public information, fire department alerts, school district notices, road closures, and local court/public meeting notices where applicable.

Use caution with open web and social sources:

- Treat social posts, forums, and community tips as unverified leads.
- Store only what is necessary for safety operations.
- Avoid collecting protected-class, private, or irrelevant personal information.
- Do not automate collection from platforms whose terms prohibit scraping.
- Escalate credible threats to local law enforcement or the appropriate fusion center rather than trying to investigate beyond the team's role.

## Suggested Build Sequence

1. Keep the current prototype as the visual benchmark and manual workflow demo.
2. Add persistent manual intake so sample observations become local records.
3. Add NWS weather alerts by configured campus latitude/longitude.
4. Add a source configuration screen for official feed URLs and local agency links.
5. Add briefing export: "next 24 hours", "Sunday service", and "open elevated items".
6. Add IPAWS only after registration/access is complete.
7. Add cyber/infrastructure checks with CISA alerts and KEV references.
8. Consider social/open-web monitoring last, and only with explicit source rules, rate limits, and privacy review.

## Current Prototype Limits

- Data is seeded in `src/lib/intelData.ts`.
- Manual intake is a visual draft only and is not persisted.
- No live collectors are enabled.
- No threat assessment is automated.
- This app supports analysis workflow; it does not replace law enforcement, emergency management, or church leadership decisions.
