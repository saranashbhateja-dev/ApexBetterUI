# Calendar Exclusion Audit — Apex OS PC v2.0

## Baseline
The exact input baseline was the uploaded `Apex OS(2).zip`, whose PC release marker identified v1.9.

## Removed from active runtime data
- `iasc-registration`
- `iasc-submission`
- `iasc-judging`
- `iasc-finals`
- `iasc-results`
- `ap-registration`
- `ap-physics-c-exam`
- `ap-calculus-bc-exam`
- `ap-central` ongoing practice resource

## Related wording updated
- Kaggle practice cadence no longer refers to developing an IASC project.
- The master competition/exam/practice calendar source no longer lists IASC milestones, AP registration/exam milestones, IASC/AP-only source references, or AP Central as an ongoing practice resource.

## Preserved
- All other competition milestones and practice resources, including ZCO, INOI/IOITC pathway milestones, IOI, SAT, and the non-AP study resources.
- No linguistics olympiad was added. The uploaded baseline did not contain one.

## Validation checklist
- [x] `node --check app.js`
- [x] Active event IDs checked for removed IDs
- [x] Active practice list checked for AP Central
- [x] Master source checked for IASC/AP event rows
- [x] Service-worker cache namespace bumped
- [x] ZIP integrity test passed

## Limitations
This is a source-code edit and static audit. It is not a live browser test, an Android build, or an end-to-end Supabase/AI test.
