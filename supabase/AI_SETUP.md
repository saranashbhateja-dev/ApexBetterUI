# Apex OS OpenRouter AI and research gateway

## What is included

- `functions/apex-os-ai/index.ts`: server-side OpenRouter gateway for general chat and source-grounded university research.
- Uses the existing private device-pairing token and validates its hash against `apex_os_workspaces` before every AI request.
- The OpenRouter key is read only from the Edge Function environment; it is never sent to PC or Android clients.
- `20261023232820_apex_os_ai_research_foundation.sql`: protected tables for research-run metadata, source registry, evidence claims and change logs.
- PC/Android-shared UI: AI Research Lab, context-aware chat, and university-specific research reports saved into the existing synced workspace state.

## Required one-time setup

1. In Supabase Dashboard → Edge Functions → Secrets, add `OPENROUTER_API_KEY` with your key from OpenRouter. Do not paste the key into this repository, `app.js`, `supabase-config.js`, Android assets, or chat.
2. Optionally add `OPENROUTER_MODEL` to select a supported OpenRouter model. Default is `openrouter/free`; confirm model availability and pricing in OpenRouter model documentation before production use.
3. Apply migration `20261023232820_apex_os_ai_research_foundation.sql` after the existing workspace migration.
4. Deploy the function from the project root with Supabase CLI:

```sh
supabase login
supabase link --project-ref bztsnkejidzjjlaghtly
supabase db push
supabase functions deploy apex-os-ai
```

5. Keep the existing `apex-os-sync` function deployed. Launch Apex OS on PC, confirm private cloud sync connects, open **AI Research Lab**, then test a low-risk chat request.

## Security and limitations

- The app has no login screen; the existing pairing file is a bearer credential. Anyone who obtains it can access the private workspace and call the AI gateway using its quota. Keep it private.
- The function validates pairing and keeps the OpenRouter key server-side, but this no-login model is intended for a personal trusted device pair. For sharing, add proper user authentication, per-user authorization and stronger rate limiting before distributing.
- Google Search grounding provides sources, not a guarantee of truth. Review official-source links, intake-year applicability, applicant eligibility and conflicts before acting. Research output is saved as a report; it does not automatically submit applications or mark checklist items complete.
- The current UI saves reports to the synced Apex workspace. The normalized evidence/source/change-log tables are included as the database foundation; this initial implementation does not yet populate every normalized claim row or run background scheduled crawls. Those are the next phase, not a feature to assume is already active.
- The deployed project function uses `OPENROUTER_API_KEY`; verify chat and research live from the app after configuring the secret.


## Human-approved dossier updates
The AI Research Lab can generate section-level proposals after research. Review each proposal and click **Approve checked & rewrite dossier**. Only selected sections are saved to the AI-maintained dossier. The original research report and personal notes remain intact; previous approved values are retained in local workspace history. This approval flow does not submit applications or mark checklist items complete.
