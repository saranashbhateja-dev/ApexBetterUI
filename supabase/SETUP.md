# Apex OS — Supabase sync status and device pairing

## Current deployment

The Supabase backend for Apex OS has been created in project `bztsnkejidzjjlaghtly`:

- Project URL: `https://bztsnkejidzjjlaghtly.supabase.co`
- Database table: `public.apex_os_workspaces`
- Edge Function: `apex-os-sync` (active deployment, version 3; `verify_jwt = false` because the function enforces the workspace pairing token itself)
- Browser / Android client configuration: `../supabase-config.js`
- Login screen / Supabase Auth sign-in: not used

The database table has Row Level Security enabled. Browser roles have no direct table privileges; the Edge Function accesses it using the server-only project key (preferring `SUPABASE_SECRET_KEYS` when available and retaining a temporary legacy-key fallback) and validates a high-entropy, per-workspace pairing token. Only the token's SHA-256 hash is stored in the table.

The project-management tools confirmed that the table exists with the expected workspace, revision, timestamp, and token-hash columns, and that the function deployment is active. An end-to-end request could not be issued from the build environment because outbound HTTP/DNS is blocked there. Therefore, the first online launch is the final runtime check: Apex OS will show **CLOUD SYNC CONNECTED** if the deployed function can complete a round-trip; otherwise it remains usable locally and displays a retrying status.

**Server-key rotation note:** The deployed function prefers the newer server-only `SUPABASE_SECRET_KEYS` dictionary and uses a compatible legacy server-key fallback only if no `sb_secret_` key is configured. Before the end of 2026, open Supabase **Settings → API Keys** and ensure a server-only secret key exists (preferably named `default`) if your project has not created one yet. I could deploy the function, but the connected project tools do not expose secret-key creation or reveal secret key values. Never copy this server key into Apex OS client files. See [Supabase API-key migration guidance](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys).

## First launch — PC

1. Extract the complete Apex OS ZIP into a normal writable folder.
2. Double-click `START_APEX_OS.bat`.
3. Keep the local server window open while using the app.
4. Open **Settings & backups** and wait for the sync status.
5. Confirm it reads **CLOUD SYNC CONNECTED** before relying on the cloud copy.
6. Select **Export device-pairing file** and transfer the resulting JSON file privately to your Android device.

The first device automatically creates its workspace row when it first contacts the Edge Function. No dashboard login or user account is required.

## Pair Android (one time)

1. Build/install the Android app from the included Android Studio project.
2. Open Apex OS on the phone and go to **Settings & backups**.
3. Select **Pair this device** and choose the pairing JSON copied from the PC.
4. Confirm **DEVICE PAIRED · SYNC ACTIVE** or **CLOUD SYNC CONNECTED**.
5. Make a harmless test change on one device and confirm the other receives it while online.

Both devices keep local state and retry when network access returns. Edits are synchronized periodically and after focus/reconnection. If both devices modify the same item concurrently, the client tries to merge non-overlapping changes; keep backups during early testing.

## Security model

There is deliberately no login screen. The pairing file is a bearer credential: anyone who obtains it can read or change this workspace. Keep it private, do not attach it to public issues, repositories, or screenshots, and do not store passwords, API secrets, or identity documents in workspace notes. The Supabase publishable key in the client is intended for public clients; never place a secret or service-role key in `supabase-config.js`, browser code, or Android assets.

The workspace row is inaccessible directly to the `anon` and `authenticated` Data API roles. The Edge Function performs its own token check and only then reads or writes the requested workspace. The `verify_jwt = false` setting is intentional because the app uses its high-entropy pairing token instead of Supabase Auth; it is safe only while the function keeps its own validation before every operation.

## Troubleshooting

- **LOCAL MODE · CLOUD RETRYING:** check that the PC/phone has internet access. Local changes are preserved and retried.
- **Pairing token was not accepted:** import the correct pairing file from the workspace-creating device; do not regenerate or edit its fields manually.
- **Workspace not found:** the creating device may not have reached the backend yet. Open it online first and wait for **CLOUD SYNC CONNECTED**, then export the pairing file again.
- **Changes do not arrive:** verify both devices show a connected state, use **Retry sync**, and check the local server is running on the PC. The phone can sync directly to Supabase and does not need the PC server to remain running after pairing.
- **Before a reset or major update:** export a JSON backup from Settings & backups.

## Redeploying after future code changes

The current function is already deployed; do not reapply the SQL migration just to start using the app. When intentionally changing the backend, install the Supabase CLI and run from the app folder:

```text
supabase login
supabase link --project-ref bztsnkejidzjjlaghtly
supabase functions deploy apex-os-sync
```

The SQL migration is retained under `supabase/migrations/` for reproducibility. Never commit secrets or the device-pairing JSON file.

## Full device setup walkthrough

For the end-to-end Windows + Supabase + Android tutorial, see `Apex_OS_Setup_Tutorial.md` in the complete bundle root.
