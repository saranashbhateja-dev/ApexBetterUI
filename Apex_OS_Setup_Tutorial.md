# Apex OS PC setup and troubleshooting

## 1. Extract and launch

1. Extract `Apex_OS_PC_Command_Centre_Fixed.zip` to a normal writable folder.
2. Double-click `START_APEX_OS.bat`.
3. The app opens at `http://127.0.0.1:8765/index.html`.
4. Keep the local server window open while you use the app.

The launcher uses Node.js when available, or Python 3 as a fallback. No `npm install` is required.

## 2. Why this build fixes the text-collapse bug

The checklist layout now uses explicit responsive grid columns. Long labels, descriptions, project text, competition cards, resources and settings copy are allowed to shrink within their parent without squeezing to one character per line.

This build also uses a versioned stylesheet URL and a new service-worker cache name. That matters because a previously opened copy could keep serving an older cached stylesheet even after the files were replaced.

The launcher also checks whether port 8765 is occupied. If a server from an older extracted copy is still running, it stops with a message instead of silently reopening that older UI. Close the old `Apex OS Local Server` window, then launch this release again. The launcher deliberately does not kill arbitrary processes.

If the old UI remains in an already-open browser tab, close that tab and launch again. A hard refresh (`Ctrl+Shift+R`) may also help. Do not clear site data unless you have exported a backup first, because local progress is held in browser storage.

## 3. Check the application

Open **Exams & documents** and inspect long items such as the Politecnico di Torino admission route and ISEEU parificato documentation. The text should use a normal multi-line paragraph layout, and the status dropdown should sit underneath the text on narrow viewports rather than squeezing it.

Open **Competitions** and confirm Bebras is absent. The active list keeps Zonal Computing Olympiad separate from Zonal Informatics Olympiad.

## 4. Supabase sync

Open **Settings & backups** and wait for `CLOUD SYNC CONNECTED`. The app stores locally first, then syncs through the deployed `apex-os-sync` Edge Function when online. If it shows local mode, read the status detail and check `supabase/SETUP.md`.

To pair another already-supported device, export the device-pairing JSON and import it on that device once. Keep the pairing file private; anyone with it can access the shared workspace. Export a separate workspace backup JSON before clearing browser data or changing anything about the local storage origin.

## 5. If the launcher says the port is already in use

That usually means an older Apex OS local server is still running from another extracted folder. Close its server command window and retry `START_APEX_OS.bat`. The updated launcher checks a small `/__apex_version` endpoint and only reuses a running server if it matches this release. It does not terminate arbitrary Node or Python processes.
