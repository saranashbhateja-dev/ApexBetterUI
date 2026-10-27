# Apex OS v2.2 — Navigation redesign

## UI changes
- Replaced the fixed left rail with a full-width sticky app navigation bar.
- Kept the workspace and delivery sections, with horizontally scrollable navigation rows for smaller screens.
- Added Settings & backups directly to the delivery navigation so it remains easy to reach.
- Kept the existing view IDs, `data-view` navigation contract, and rendering functions unchanged.
- Simplified mobile navigation: it remains scrollable and does not depend on opening a side drawer.
- Bumped the stylesheet URL and service-worker cache namespace to avoid stale CSS.

## Validation
- `app.js` and `server.cjs` pass Node syntax checks.
- `server.py` passes Python bytecode compilation.
- ZIP integrity checked after packaging.
- APK build and live PC-to-Android cloud sync are not claimed as tested in this environment.
