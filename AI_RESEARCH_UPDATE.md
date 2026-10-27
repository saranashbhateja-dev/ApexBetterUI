# Apex OS AI Research Lab — implementation notes

Implemented in this source bundle:
- AI Research Lab navigation and UI.
- General OpenRouter chat with optional context from the existing Apex workspace.
- University-specific research jobs using Google Search grounding.
- Reports and returned source URLs saved into the synced local-first state and shown in the relevant university drawer.
- Secure Edge Function that validates the existing private workspace pairing token and reads `OPENROUTER_API_KEY` only server-side.
- SQL foundation for source registry, evidence claims, research runs and reversible change-log records.
- Setup instructions for applying the migration, adding secrets and deploying the Edge Function.

Not yet implemented/verified: live deployment, an actual OpenRouter request, background scheduled crawls, automatic ingestion of every PDF into normalized evidence rows, and background scheduled crawls and automatic ingestion of every PDF into normalized evidence rows. Approved rewrites update the AI-maintained dossier in synced workspace state; they do not rewrite static baseline metadata, mark requirements complete, or submit applications.


## Approved dossier rewrites
- After a research report is saved, the user can ask OpenRouter to prepare structured proposed updates.
- Each proposed section has a checkbox, rationale, confidence label and source links.
- Nothing changes until the user selects sections and confirms approval.
- Approved sections are written into the separate AI-maintained university dossier, displayed in the university drawer, and previous approved values are retained in local workspace history. Original static reference snapshots and personal notes are not overwritten.


## OpenRouter research prompt-size fix

The proposal-generation request now includes a shorter excerpt of the saved research report so its prompt stays within the backend chat endpoint's 12,000-character input validation. This reduces prompt size; it does not reset OpenRouter daily token quota. If OpenRouter reports a tokens-per-day limit, wait until the provider's reset time or use a model/project with available quota.


## OpenRouter v1.4 update

- Proposal-generation prompts are bounded and skip web search because they compare an already-saved report.
- Research requests use OpenRouter web search with up to three search uses per request and a four-step tool-call cap. Web search may incur a separate charge; this cap limits, but does not eliminate, cost.
- University research applies the English-taught / no additional-language-fluency filter and marks unclear requirements unresolved.
