# Competition, Exam & Practice Calendar Audit — v1.6

## Implemented
- Added the fixed date-based milestones supplied for October 2026 through May 2027.
- Added undated INOI-2027, IOITC-2027, and IOI-2027 conditional milestones.
- Reused existing IASC registration, submission, judging and finals records where they already existed; added the results milestone.
- Added all 14 requested practice resources and the supplied cadence text. Existing unrelated roadmap entries remain intact.
- Added `source-material/master-competition-exam-practice-calendar-2026-2027.md` and linked it in the Reference Library.
- Synced the updated JS and source Markdown to the Android WebView assets.

## Validation
- JavaScript syntax check: pass.
- Source calendar exists in PC and Android assets: pass.
- PC/Android app.js byte equality: pass.
- PC/Android service-worker cache version equality: pass.
- Archive integrity: checked after packaging.

## Limitations
- Calendar facts were transcribed from the user's supplied plan and not independently verified.
- ZCO is deliberately shown both as an official-date-pending entry and as a user-supplied tentative date because the two conflict.
- Android APK compilation and live sync were not run as part of this source ZIP update.
