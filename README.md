# Apex OS — PC Command Centre

## v2.3 — Account sign-in and scrollable navigation

Added a Supabase Auth email/password sign-in and account-creation screen, password-reset flow, persistent sessions, and a local-only entry option. Navigation is back to a vertical sidebar: on desktop the entire sidebar scrolls as one region, and on mobile it opens as a scrollable drawer with a backdrop and close controls. This avoids the crowded top bar and makes lower destinations reachable. See `RELEASE_NOTES_v2.3.md`.

**Important:** sign-in gates the UI on this device, but the existing cross-device sync still uses the separate workspace pairing token. Cloud data is not automatically isolated by login account in this release. Supabase Auth email/password must be enabled; the JS client loads from jsDelivr, so account sign-in needs an internet connection. Local mode remains available.

## v2.0 calendar update

The active calendar excludes IASC and AP registration/exam milestones, and AP Central has been removed from the ongoing practice list. See `RELEASE_NOTES_v2.0.md` and `COMPETITION_EXAM_PRACTICE_CALENDAR_AUDIT_v2.0.md`. No linguistics olympiad was added.


A local-first personal command centre for undergraduate STEM admissions preparation, competition planning, exams and documents, engineering projects, learning paths, and an evidence-gated portfolio/CV workspace. This release includes the **PC app bundle** plus a Capacitor/GitHub Actions workflow for building a debug Android APK.

## Launch on Windows

1. Extract the ZIP to a normal writable folder.
2. Double-click `START_APEX_OS.bat`.
3. Keep the local server window open while using the app. It opens `http://127.0.0.1:8765/index.html`.

The launcher uses Node.js when available, or Python's built-in HTTP server as a fallback. It does not require `npm install`.

## Important: this release forces the fixed layout to load

The text collapsing into one character per line was caused by a stale service-worker asset cache in some previously used copies, in addition to the checklist layout needing a firm grid boundary. This release contains the responsive grid/wrapping guardrails, changes the CSS URL, and bumps the service-worker cache namespace so the old stylesheet is not reused.

After extracting this version, launch it using the BAT file. If an old browser tab still shows the previous layout, close that tab and reopen the app from the BAT file. If needed, use `Ctrl+Shift+R` on the app tab. Do **not** clear browser site data unless you first export a workspace backup; clearing site data can delete local progress.

## Sync between PC and a previously paired device

Apex OS uses Supabase workspace snapshots. The table `public.apex_os_workspaces` has Row Level Security enabled and no direct browser-role table access. The active `apex-os-sync` Edge Function checks a random workspace ID and pairing token; only the token's SHA-256 hash is stored in the database.

The PC creates its workspace on first online launch. Open **Settings & backups**, wait for **CLOUD SYNC CONNECTED**, and export the device-pairing JSON. Import that file once on the other device. Keep the pairing file private: anyone who obtains it can access the workspace.

The database schema and function deployment were verified through the connected Supabase tools, but a live HTTP round-trip was not testable from the build environment because outbound DNS/network access was unavailable. The first online launch is the final end-to-end check. If it stays in local mode, read the detail in Settings and `supabase/SETUP.md`.

## AI dossier workflow (v1.4)

The AI Research Lab uses the server-side OpenRouter gateway. University profiles include a current-vs-proposed dossier comparison table, individual Approve/Reject controls, a formatted research report, and separate AI-maintained approved sections with history. Research is tailored to STEM, CS, EE, AI/ML and filters for English-taught programmes that do not require fluency in another language; ambiguous language requirements are marked unresolved. After extracting this release, reopen the app from the launcher or press `Ctrl+Shift+R` to ensure the updated scripts load.

See `APP_ARCHITECTURE_v1.4.md` for the runtime boundaries, research-to-approval flow, safety guardrails, and remaining modularization opportunities.

## What is inside

- Six active US university targets: MIT, Stanford, Harvard, Caltech, Yale and Princeton. The prior Italy, Singapore and Canada targets are no longer active.
- Chronological competition tracker with the Zonal Computing Olympiad kept separate from ZIO. **Bebras is not part of the active competition list or roadmap.**
- A combined Competitions & exams workspace and a separate document-only checklist.
- 20 projects organized into four tracks, with specification drawers, verification gates, evidence logs and search.
- Six learning paths, reference archive, and a CV/portfolio draft that only promotes projects after verification gates and evidence are recorded.
- `source-material/` preserves the latest project lineup and the complete `final-source-of-truth.md` as an additional reference.
- `supabase/` contains the deployed Edge Function source, SQL migration, configuration and troubleshooting notes.

## Data and privacy

Progress saves to browser/app local storage first. Use **Settings & backups → Export backup JSON** before moving the app folder, changing browsers, or clearing storage. Do not store passwords, API secrets or sensitive identity documents in notes. The publishable Supabase key in the client is intended for public use; server secrets are not included in this package.

See `BUILD_NOTES.md` and `Apex_OS_Setup_Tutorial.md` for extra setup notes.


## Gemini AI Research Lab (new)

Apex OS now includes a secure-gateway UI for context-aware chat and university research reports. Configure the server-side `GEMINI_API_KEY` and deploy `supabase/functions/apex-os-ai` using `supabase/AI_SETUP.md`. Never put the key in client files. Reports are saved to the existing workspace and surfaced in university drawers. Research results require review; they do not automatically submit forms or mark requirements complete.


Research reports now support human-approved dossier rewrites: inspect section proposals, select only the ones you accept, and approve them to update the AI-maintained dossier while preserving personal notes and the original report.


## Release v1.5 — Fall 2028 University dossiers
The active shortlist has been rebuilt cleanly around the six US universities in the supplied guide. Non-US profiles and old global-shortlist references are excluded from active university data. The source file is preserved in `source-material/`. The AI comparison workflow now calls the dedicated `propose_updates` endpoint with JSON mode; proposal approval remains human-controlled. See `UNIVERSITY_DOSSIER_AUDIT_v1.5.md`.


## Release v1.6 — Master Competition, Exam & Practice Calendar
The Competition workspace now includes the supplied October 2026–May 2027 competition and exam milestones, conditional INOI/IOITC/IOI items, and the requested recurring practice resources with their intended cadence. User-supplied dates are not treated as official verification; the ZCO date conflict is explicitly retained. See `COMPETITION_EXAM_PRACTICE_CALENDAR_AUDIT_v1.6.md`.


## Release v1.7 — Unified calendar and updated admissions guidance
The active timeline and practice resources have been replaced with the supplied 2026–2027 Master Competition, Exam & Practice Calendar. The navigation separates **Competitions & exams** from the document-only **Documents** checklist. Only six US university cards and source dossiers are active. The active Reference Library exposes the new calendar and US guide as the source of truth; old global and Italy admissions dossiers are no longer listed as active references. User-supplied dates and cycle-specific admissions claims remain unverified until checked against official sources.


## v1.9 date verification update

The competition calendar was checked against IARCS, IASC, College Board, and the official IOI 2027 website on 25 October 2026. See `RELEASE_NOTES_v1.9.md` and the calendar source document for verified dates, remaining TBA items, and caveats.


## Android APK build (added in v2.1)

The project now includes `.github/workflows/build-apk.yml`, `package.json`, `capacitor.config.json`, `android-build.bat`, and `APK-BUILD-GUIDE.md`.

For the easiest build, push the contents of this folder to a GitHub repository and run **Actions → Build Apex OS APK → Run workflow**. Download the `Apex-OS-debug-apk` artifact from the completed run. A local build is also available via `android-build.bat` when Node.js 22+, Java 21, and the Android SDK are installed.

The APK contains the frontend assets. The Node.js server-side AI gateway is not bundled into the APK; server-dependent AI features require a separately hosted HTTPS backend. Supabase sync requires network access and should be tested on-device.
