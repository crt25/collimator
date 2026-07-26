# Exploratory testing charter — Collimator mock stack (main @ c3d63d5c)

Session A (teacher/admin): http://localhost:3210   Session B (student): http://localhost:3211
Identity switch: POST http://localhost:3888/user
Known-open (do NOT report as new): #625 progress polling, #611 lesson removal, #607 starred-past-solutions view.

## 1. Admin (Jane Doe seeded)
- [ ] login via mock OIDC; landing/nav sanity
- [ ] user CRUD: create teacher+admin, rename, promote/demote, delete; >10 users pagination + search (regression of e2e pagination find)
- [ ] i18n toggle EN/FR on admin pages

## 2. Teacher (scratch)
- [ ] class CRUD; students page (empty state)
- [ ] task create (scratch): edit modal, save-gating (CRT-438-family), import/export, long title clamp (CRT-431)
- [ ] reference solutions: save-validation errors visible when clicking save (CRT-401), create ref solution via external app
- [ ] session create private + anonymous, task ordering, share link
## 3. Teacher (jupyter, if built)
- [ ] task create (jupyter): kernel auto-select (CRT-399: no kernel picker dialog), save → student version generated (spinner + i18n message, CRT-438)
- [ ] locale switch inside edit modal (CRT-363 crtMode survives; no teacher-notebook leak: solve/view mode never shows template)

## 4. Student (session B)
- [ ] anonymous join via link; ad-hoc identity; solve scratch task; green flag run (CRT-422 area); submit; toasts
- [ ] jupyter solve: task.ipynb opens (student copy, not template!), edit cell, autosave, locale switch mid-work → work restored (CRT-397), reload → work restored
- [ ] private session join: signin-student flow + teacher approval handshake (A approves B) via websocket
- [ ] student names in teacher progress: anonymous lesson shows ONLY ad-hoc identities (CRT-439 verify on main)

## 5. Cross-cutting
- [ ] progress page manual refresh shows submissions (no polling yet, #625)
- [ ] per-task progress, student solution view, star/unstar (showcase), dissimilar pairs (needs analyses → cron enabled in dev stack? startBackend disables crons! NOTE: analyses will NOT run → analysis views empty — either flag finding or restart backend without DISABLE_SCHEDULED_TASKS)
- [ ] anonymize-names dial on private lesson progress
- [ ] FR locale across student flow
