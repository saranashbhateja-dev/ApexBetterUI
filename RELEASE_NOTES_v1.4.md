# Apex OS PC — v1.4 OpenRouter and Dossier UX

## Fixed
- Shortened the AI proposal prompt (report excerpt, source list and baseline are bounded) so the request stays safely below the 12,000-character chat input limit.
- Corrected the proposal parser error message to name OpenRouter.
- Removed a duplicate event listener on university-table Approve buttons.

## University dossier workflow
- Every university profile contains a structured comparison table for baseline/current values versus proposed values.
- Comparison sections now include STEM/CS/EE/AI-ML fit and English-medium / additional-language eligibility.
- Each proposed row has individual Approve and Reject actions. Approving rewrites only that dossier section after confirmation; rejection discards that proposal only. Original notes, status, checklist state and source report remain unchanged.
- AI-maintained dossier history continues to retain prior approved values.

## Research UX and eligibility rules
- Research is tailored to STEM, Computer Science, Electrical Engineering, AI and Machine Learning.
- Hard filter: only consider programmes taught in English that do not require fluency in another language. When official evidence is unclear, mark eligibility unresolved rather than claiming the programme qualifies.
- Research output renders Markdown headings, emphasis, lists, links and tables for readability.
- Refreshed cache namespace and asset versions so browsers pick up the new UI.
- Added app-wide keyboard focus visibility, reduced-motion handling, consistent surface transitions, and an architecture note describing runtime boundaries and state invariants.

## Important limits
- The Supabase Edge Function was deployed separately; this ZIP updates the PC client bundle and includes the matching OpenRouter function source for reference.
- A live end-to-end AI request still needs to be tested from the user's paired app. Model and web-search availability depend on OpenRouter and selected provider limits.
