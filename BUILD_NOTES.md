# Apex OS PC release — build and validation notes

## Scope

This is the PC-only bundle. Android Studio sources, APK scripts and GitHub APK workflows are intentionally excluded from this ZIP.

## UI repair and cache invalidation

- Fixed the exam/document checklist row with explicit CSS grid tracks, `minmax(0, 1fr)`, minimum-width resets and a mobile breakpoint that places the status selector below the text.
- Added final text wrapping safeguards to checklist, competition, project, university, learning-resource, library, drawer and settings copy.
- Versioned the stylesheet URL and bumped the service-worker cache name from v4 to `apex-os-static-v5-ui-fix-20261024`. This avoids reusing the older cached CSS after replacing the ZIP.
- The app stylesheet is loaded via `styles.css?v=ui-fix-20261024`; the service worker pre-caches the exact versioned URL.

## Competition selection

- Bebras is not present in the active event definition or current competition roadmap. Legacy saved `eventState.bebras` is discarded during state restore so it does not reappear from old local state.
- Verbatim source documents are retained for reference only; active event lists are defined by the application data and active competition roadmap.

## Supabase

- Project ref: `bztsnkejidzjjlaghtly`
- Workspace table: `public.apex_os_workspaces`, RLS enabled, no direct browser-role privileges.
- Edge Function: `apex-os-sync`, active deployment version 3 at the time of packaging.
- The client ships only the publishable key; server secret keys are not included in this ZIP.
- Backend table and deployment were inspected using connected Supabase tools. Live HTTP sync could not be verified from the build environment because outbound network/DNS access was blocked; verify the first online launch in Settings.

## Checks performed for this bundle

- JavaScript syntax checks (`app.js`, `sync-client.js`, `source-project-details.js`, `server.cjs`).
- HTML stylesheet/cache version references checked.
- Static assertions: active events do not include Bebras; source roadmap does not include Bebras; old progress migration cleanup remains; all 20 project specs remain present.
- ZIP integrity and file manifest checked.

## Browser test limitation

Headless Chromium was blocked by the environment's browser access policy on local/file URLs during this packaging pass, so no new live browser screenshot is claimed for this exact ZIP. CSS guardrails and the prior visual regression fix are present; after extraction, launch `START_APEX_OS.bat` and check the previously affected rows.
