# Apex OS — Architecture Notes (v1.4)

## Runtime boundaries

- **Presentation:** `index.html` defines views and semantic structure; `styles.css` owns responsive layout, shared visual tokens, table overflow, focus indicators, and reduced-motion behavior.
- **Client application/state:** `app.js` owns view rendering, user interactions, local workspace state, university dossier comparison, proposal selection, and approval confirmation. The existing local-first state model remains in place.
- **Sync transport:** `sync-client.js` sends workspace snapshots through the existing Supabase sync function. Pairing credentials remain private and should never be copied into public frontend code.
- **AI gateway:** `supabase/functions/apex-os-ai/index.ts` validates the paired workspace before calling OpenRouter. `OPENROUTER_API_KEY` remains server-side.
- **Persistence:** AI research reports, proposed changes, approved dossier sections, and approval history are separate from the baseline university metadata, personal notes, status, and checklist state.

## Research-to-approval data flow

1. Select a university and intake; research runs through the server-side OpenRouter gateway with a bounded web-search tool budget.
2. Save the report and source links to the workspace; report output is rendered as a safe Markdown subset.
3. Generate concise proposals from the saved report without triggering a second web search.
4. Compare each proposal against the current baseline or previously approved section in the university profile table.
5. Approve a row or selected set only after confirmation. Only approved sections are rewritten; a history record retains previous and next values.
6. Rejecting a proposal discards that proposal and leaves approved dossier data unchanged.

## Guardrails

- The AI never marks application requirements complete, changes personal notes, or submits applications automatically.
- Programme fit requires English-taught delivery and no additional-language fluency requirement. Unclear evidence remains unresolved.
- Search is capped at three tool uses per request and four total tool steps. Search may still incur provider charges; the cap limits rather than eliminates cost.
- Research results remain evidence to review, not a guarantee of admission, eligibility, or funding.

## Remaining engineering boundary

This release hardens the existing vanilla-JS architecture and its data boundaries rather than claiming a full framework migration. A future larger refactor could split university, research, projects, competitions, and settings into independent modules with shared typed state contracts and automated end-to-end tests.
