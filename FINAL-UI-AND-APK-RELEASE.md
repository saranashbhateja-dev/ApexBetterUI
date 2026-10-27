# Apex OS v2.1 — Final UI and APK workflow

- Updated the visual system with a richer dark-navy canvas, ambient teal/violet glow, gradient KPI cards, rounded panels, and clearer active navigation.
- Kept the existing navigation, view IDs, and application scripts in place to avoid breaking app logic.
- Bumped stylesheet and service-worker cache versions to reduce stale UI reuse.
- Added Capacitor configuration, npm dependencies, a Windows local APK build script, and a GitHub Actions debug APK workflow.
- Added `APK-BUILD-GUIDE.md` and updated the main README with build instructions and backend limitations.

Validation in this release: archive structure, JSON parsing, required workflow/config files, and JavaScript syntax were checked. A live browser QA pass and actual Android APK build were not run in this environment.
