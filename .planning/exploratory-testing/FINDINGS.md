# Exploratory testing findings — Collimator

**Base:** `main` @ `c3d63d5c` (dev-stack code on branch `feature/dev-mock-stack`).
**Date:** 2026-07-25.
**Method:** interactive mock-OIDC dev stack (`task dev:mock`), driven with Playwright probe
scripts under `e2e/.devmock/` (gitignored scratch — the living reproductions; see each finding).

## How to reproduce the environment

1. `task db:run` (postgres on :5432)
2. `task dev:mock:build` once (backend + frontend-for-http-mock + scratch + jupyter)
3. `task dev:mock` → teacher/admin UI on http://localhost:3210, isolated student session on :3211,
   backend :3998, mock OIDC :3888.
4. Switch the authenticated identity: `curl -X POST http://localhost:3888/user -d '{"oidcSub":"1234","email":"jane@doe.com","name":"Jane Doe"}'`
   - Seeded admin: Jane Doe (oidcSub 1234), key-pair password `hunter2`.
   - Seeded teacher: Richard Feynman (oidcSub 5678), registration token `123-456-789`.
5. Probe scripts run with `cd e2e && npx tsx .devmock/<script>`. Saved auth states:
   `.devmock/admin-state.json`, `.devmock/teacher-state.json` (Playwright storageState, reusable).

> NOTE: `e2e/.devmock/` is gitignored. These scripts are the reproductions; promote to a tracked
> location (or fold into e2e specs) if this should survive review long-term.

---

## Confirmed working (regressions verified live)

- **CRT-397 (Jupyter locale reload keeps work):** PASS. Student typed `# CRT397 marker` into the
  notebook, switched EN→FR, app reloaded, marker + notebook restored. Repro: `.devmock/s5-jupyter-locale.mts`
  → `{"restored":true,"markerFound":true}`.
- **CRT-439 (anonymous lesson shows only ad-hoc identities):** PASS. Anonymous progress list showed
  `aardwolf-77` / `albatross-78`, no class-roster names. Repro: `.devmock/s1.mts`.
- **Teacher registration flow (token → OIDC → key-pair creation):** works end-to-end; not covered by
  any existing test. Repro: `.devmock/t4-teacher-register.mts`.
- **Generic (non-CRT-internal) notebook zip rejected with a clear error** (`loadTask` →
  `MissingRequiredFilesError: … template.ipynb, student.ipynb, autograder.zip`). Good failure surface.

---

## Findings

### F1 — "Correct" Scratch fixture fails its own assertion  ·  RESOLVED: expected, not a bug
**Resolution (user, 2026-07-25):** in these fixtures "correct" means a *well-formed* submission, not
one that passes the task's assertion. A failed assertion for `solutions/correct/*` is therefore
expected; this is not a defect. Kept for the record; no action. (Original detail below.)

_Original:_ severity: MEDIUM · confidence: HIGH
The fixture `e2e/tests/sessions/tasks/scratch/check-x-position-with-assertion/solutions/correct/task.sb3`,
submitted through the real student submit path, produces a **failed** assertion, so the teacher
progress shows "Incomplete" for a supposedly-correct solution.
- **Repro:** `.devmock/s2-correctness.mts` → `{"passed":[], "failed":[{"name":"Unnamed Assertion", ...}]}`.
- **Evidence:** DB after two anonymous submissions (correct + incorrect): both `StudentSolution` rows
  have `SolutionTest.passed = f`. `SELECT ss.id, ss."studentId", st.name, st.passed FROM "StudentSolution" ss LEFT JOIN "SolutionTest" st ON st."studentSolutionId"=ss.id;`
- **Impact:** either the fixture is mislabeled or the assertion runner is wrong. Also means the e2e
  suite cannot currently distinguish correct from incorrect solutions (it only counts rows).
- **Open question:** is `checkXPosition.solutions.correct[0]` genuinely expected to pass its assertion?

### F2 — Kernel-select dialog shown to students despite CRT-399  ·  severity: MEDIUM  ·  confidence: LOW (env-sensitive)
On opening the student notebook, JupyterLab's "Select Kernel" dialog appeared, listing
`Python (Pyodide)` / `otter-session` / `No Kernel` — i.e. the picker CRT-399 aims to suppress.
- **Repro:** `.devmock/s5-jupyter-locale.mts` → logs `DIALOG TEXT: Select Kernel | … Python (Pyodide) | No Kernel | otter-session …`.
- **Caveat:** may be specific to headless chromium / this dev build; the pyodide kernel is slow to
  become "ready" here (see F3), which is exactly the window CRT-399's wait targets. **Must be
  re-checked on real hardware / a real browser before filing.** Screenshot: `.devmock/shots/s5-notebook.png`.

### F3 — Headless pyodide kernel never reaches "ready" → Jupyter task SAVE hangs  ·  severity: TESTING-INFRA  ·  confidence: HIGH
Creating a Jupyter task through the UI (import → modal Save) runs otter grading, which needs a ready
pyodide kernel. In headless chromium the kernel never prepares, so the save spins indefinitely
(observed >10 min; modal never closes). Last logs stall at
`[commands/grade] Executing notebook … / [utils] Waiting for session context to be ready…`.
- **Repro:** `.devmock/t2b-jupyter-save.mts` (long-running; captured in task output).
- **Impact — design input for Jupyter e2e:** full-fidelity teacher-save tests are not viable in CI.
  Workaround proven: **API-create the Jupyter task** from a synthesized CRT-internal zip
  (`template.ipynb` + `student.ipynb` + empty `autograder.zip`) — see `.devmock/t3-api-jupyter-task.mts`
  — then the student solve/locale flow works headless. Recommend Jupyter e2e bypass grading this way.

### F4 — Login button swallows OIDC discovery failures (no user feedback)  ·  severity: LOW-MEDIUM  ·  confidence: HIGH
`onAuthenticateWithMicrosoft` calls `redirectToOpenIdConnectProvider(...)` without awaiting or
catching. When discovery/userinfo fails, the promise rejects unhandled and the UI does nothing —
the user clicks "Authenticate" and sees no change and no error.
- **Evidence:** before the CORS fix, clicking produced a console error and zero UI change
  (`.devmock/probe-login2.mjs`). File: `frontend/src/pages/login/index.tsx:47`.
- **Fix direction:** await + surface an error toast on failure.

### F5 — Teacher can reach List Users + admin-only UI affordances  ·  severity: MEDIUM  ·  confidence: HIGH
**Now settled by the access-rights matrix (D1 in PERMISSION-MATRIX-RESULTS.md): this is a real
deviation, not just a UI leak.** Matrix says Teacher·List·User = ❌, but `GET /users` (no `@AdminOnly`,
so the RoleGuard default `[ADMIN,TEACHER]` admits teachers) returns 200 scoped to self, and the UI
renders the full "User Manager" page with a **Create User** button that then 403s on submit.
- **Repro:** `.devmock/t5-teacher-perms.mts` (page + Create User visible; `GET /users` → 200) and
  `.devmock/t6-teacher-create-user.mts` (`POST /users` → 403).
- **Fix direction:** add `@AdminOnly()` to `users.controller.ts::findAll`; UI hides User Manager
  nav + Create-User affordance for teachers.
- See also **Q1** (PERMISSION-MATRIX-RESULTS.md): "Anyone View/Download Task" requires auth (401
  unauthenticated) — needs a product decision on whether "Anyone" means public.

### F6 — jupyter-app console errors during student solve  ·  severity: LOW  ·  confidence: MEDIUM
Repeated `TypeError: Cannot read properties of null (reading 'widget') at d.setContent (jlab_core…)`
and asset 404s while the notebook loads. Non-fatal (notebook still opened) but noisy; needs triage.
- **Evidence:** `.devmock/s5-jupyter-locale.mts` error log.

### F7 (test-infra) — `getSessionLink` page-model leaves the share modal open  ·  severity: LOW
`SessionListPageModel.getSessionLink` (via `page-models/list-page-model.ts`) opens the share modal
but does not close it, so a second call in the same page is blocked by the still-open dialog
("intercepts pointer events"). Repro: `.devmock/t1.mts` failed on the 2nd link fetch; `.devmock/t1b.mts`
works because it uses a fresh page. Affects anyone fetching two session links from one page object.

---

## Not yet explored (next session)

- Private-session join + teacher approval **websocket handshake** (A approves B).
- Admin user CRUD breadth (promote/demote/delete, pagination >10, search).
- Full **permission matrix** admin vs teacher vs student — pending the requirements table from the
  user; plan is to probe each capability at both UI and API layers and classify each cell as
  enforced / UI-leak-only / backend-gap. F5 is the first such cell.
- FR locale across the whole student flow; anonymize-names dial on a private lesson.

---

## Round 3 — UI bugs affecting teachers' understanding of student data (2026-07-27)

Focus per Pierluca: UI bugs that affect a student's performance or a teacher's
understanding of student data. Static analysis this round (live browser
exploration deferred so it does not contend with the running Jupyter grading
investigation on the shared machine).

### B13 — CONFIRMED, FIXED — teacher progress/analysis views render BLANK on a load error
Branch `bugfix/multiswr-suppresses-later-errors` (off origin/main), fix + jest test.

`MultiSwrContent` decided which load errors to surface by filtering the
already-compacted `nonLoadingErrors` array and then indexing the ORIGINAL
`data`/`isLoading` arrays with the compacted index. Those indices only line up
when every failing source precedes every succeeding one. So an error on a
*later* source, after an earlier source had resolved, was matched against the
wrong data slot and dropped; with no error shown and not all data present the
component rendered `null`.

Impact: this is exactly the shape of the teacher progress view (`ProgressList`,
`data={[klass, session, solutions]}`): class + lesson load, student solutions
fail -> teacher sees a BLANK panel, no error, no spinner. Indistinguishable
from "no students have submitted yet". Same for every analysis dashboard
(`Analyzer`, `CodeView`, `DissimilarityAnalysis`, `DissimilarPairs`), which all
load the student data as a later source. Reproduced deterministically with a
jest test (later-source failure fails pre-fix, first-source + stale-data cases
pass). Corroborated independently: the B3 sub-agent flagged the same indexing
bug in passing.

### Checked and cleared this round (no bug)
- `getTaskStatus` (task-progress.tsx): correctly prefers a submitted solution's
  tests over activity-analysis tests, with a documented rationale; complete iff
  tests exist and all pass. Sound.
- `findSolutionToDisplay`: returns the most recent solution by createdAt. Sound.
- `findAnalysisToDisplay`: prefers a non-reference (real) analysis over a
  reference/starred one. Reference solutions do not masquerade as student work.
- `useStudentProgress`: anonymous lessons show only active (acting) students by
  ad-hoc identity - intended (CRT-439), not a leak. Non-anonymous seed the
  roster. Correct.
- Subtask filtering (`useSubtaskAnalyses`/`useSubtasks`): component ids are
  strings end-to-end, Select values are strings - no string/number mismatch.

### Live-exploration checklist (do once the Jupyter agent frees the machine)
Bring up `task dev:mock` (separate DB `collimator-devmock` + ports
3210/3211/3888/3998; does not collide with e2e). Drive as teacher + student:
1. Progress view with a mid-load API failure -> confirm B13 fix shows an error,
   not a blank (needs the fix branch built).
2. Analysis dashboards: does a point/row map to the correct student? scatter
   axes/labels correct? subtask switch updates the plot?
3. Student solution detail + preview: does the preview match the student's
   actual latest submission? (activity-vs-preview parity was OK earlier for
   Scratch; recheck after edits.)
4. Session/lesson student counts and status badges vs. actual DB state.
5. Number/percentage displays in reports for off-by-one or rounding that would
   mislead (e.g. "X of Y completed").
