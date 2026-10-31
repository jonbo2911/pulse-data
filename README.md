# Pulse data

Daily snapshot of what's on in Brussels for the Pulse iOS app, rebuilt every morning from official provider APIs (agenda.brussels, Ticketmaster) by the private ingest in `pulse-ios`.

- `brussels.meta.json`: `generatedAt`, event count and size; the app checks this first
- `brussels.json`: the full snapshot
- `cache/summaries.json`: AI summaries (en/fr/nl) keyed by a hash of each description, so unchanged events are never summarised twice

Served at https://jonbo2911.github.io/pulse-data/. This branch is replaced on every run (no history).
