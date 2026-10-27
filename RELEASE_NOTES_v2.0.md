# Apex OS PC v2.0 — Calendar Scope Update

Built from the user's uploaded `Apex OS(2).zip` (PC v1.9).

## Changes
- Removed IASC registration, submission, judging, finals, and results from the active Competition timeline.
- Removed the AP Physics C + AP Calculus BC registration/payment target.
- Removed AP Physics C: Mechanics and AP Calculus BC exam events.
- Removed AP Central from the ongoing practice-resource list.
- Changed Kaggle's cadence text so it no longer depends on an IASC project.
- Updated the master calendar source to match the active app data.
- Bumped the service-worker cache namespace to avoid serving the prior calendar from cache.
- Kept the unrelated existing milestones and resources unchanged.

## Scope note
This release makes no additions for any linguistics olympiad. The supplied archive did not contain a linguistics olympiad entry, and none was added.

## Validation
- JavaScript syntax check: to be run during packaging.
- Runtime calendar records checked against the explicit removal list.
- Master calendar source checked for remaining IASC/AP event rows and AP Central practice row.
- ZIP integrity check: to be run after packaging.

## Not performed
- No Android APK build.
- No live Supabase/AI end-to-end test.
- No external re-verification of the remaining competition dates.
