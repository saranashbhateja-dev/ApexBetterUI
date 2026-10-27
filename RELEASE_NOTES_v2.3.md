# Apex OS v2.3 — Account Gate & Scrollable Navigation

## UI changes
- Added a Supabase Auth email/password sign-in and account-creation screen.
- Added password-reset email flow and persistent session handling.
- Added a deliberate local-only entry option for offline use.
- Replaced the crowded top navigation with a familiar vertical sidebar.
- Made the complete sidebar a single vertically scrollable region so lower destinations remain reachable.
- On mobile, the sidebar opens as a drawer with a dimmed backdrop, close button, and Escape-to-close behavior.
- Added account identity and sign-out controls in the sidebar footer.
- Updated service-worker cache namespace and release version.

## Important sync note
Authentication gates the UI on this device. The existing cross-device sync remains based on the separate workspace pairing token; this release does not make cloud data account-isolated. Keep the pairing file private.

## Requirements / validation
- Supabase Auth email/password must be enabled for account sign-in and sign-up. Email confirmation behavior depends on the Supabase project settings.
- The Supabase JS client is loaded from jsDelivr, so sign-in requires network access. Local mode remains available if the account service cannot load.
- Syntax and archive integrity checks should be completed before distribution; an end-to-end live auth test requires a configured test account.
