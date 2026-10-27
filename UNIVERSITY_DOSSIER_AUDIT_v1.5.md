# Apex OS — Fall 2028 University Dossier Audit

## Implemented
- Added the supplied Fall 2028 Markdown dossier to `source-material/` and the Reference Library.
- Added a per-university source table for all 12 shortlist entries, with exams, documents, scholarships/aid, cost notes, deadlines, and risks.
- Added the official-source register and per-university verification checklist as expandable sections.
- Preserved the full supplied university excerpt and clearly labelled it as a research synthesis requiring official cycle-specific verification.
- Retained the existing AI proposal comparison, per-row Approve/Reject controls, and approved-section history.
- Fixed the proposal-generation path to call the dedicated `propose_updates` Edge Function action; the endpoint now accepts that action and requests JSON mode from OpenRouter.
- Bumped the service-worker cache so updated app code and dossier data can load.

## Audit notes / limitations
- The source file itself warns that some deadlines, scores, costs, scholarship coverage and eligibility claims are approximate, prior-cycle, or potentially inconsistent. The app does not silently convert these into verified facts.
- The source table is labelled as source-derived; official university and scholarship pages remain authoritative.
- The OpenRouter/Supabase proposal flow is code-reviewed and syntax-checked locally, but a live end-to-end test requires a paired Apex workspace and configured `OPENROUTER_API_KEY`.
- No application portal is submitted and no requirement checklist is auto-completed by research.
