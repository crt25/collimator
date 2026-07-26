# Autonomous exploratory session 2 — log

Branch: `feature/dev-mock-stack` (working branch). **NEVER touch origin/main.**
Scope: UI bugs · lockout flows · data corruption · understandability (error messages) ·
translation consistency · security · network-failure robustness. Plus: verify recently-merged
fixes; full lesson→students→reports flow with the analysis (piscina) worker; student-solution
previews vs. student activity.

Rules in effect: park irreversible decisions (ask when back); reversible → best guess + note here;
real bug → write an E2E test that demonstrates it; 99%-sure bug → spawn adversarial subagent to
review + write a local fix on a separate branch (NO push); WIP draft PRs allowed for CI/Copilot.

Env: dev stack (mock OIDC). DB resets on each `dev:stack` restart → re-run `.devmock/bootstrap-auth.mjs`
(admin login + teacher registration). Analysis crons ON in the dev stack.

## Recently-merged fixes to verify
- CRT-397 Jupyter locale-reload keeps work · CRT-399 kernel dialog suppressed · CRT-363 crtMode leak
- CRT-431 title clamp · CRT-401 ref-solutions save validation · CRT-439 anon progress identities
- CRT-435 progress polling · CRT-388 block-limit drag-to-sprite

## Findings (append as discovered)

### B1 — Uncaught TypeError on student-solution detail page (`getStudentNickname(NaN)`)  ·  MEDIUM  ·  confidence: 99%
Navigating to `/class/:c/session/:s/task/:t/student/:studentId` throws an uncaught
`TypeError: Cannot read properties of undefined (reading 'en')` on **every** load.
- **Root cause:** `useStudentName.ts:87` `useMemo` → `getStudentNickname(studentId, locale)`; the page
  (`.../student/[studentId]/index.tsx:73`) computes `studentId = parseInt(studentIdString, 10)`, and on
  the first client render (static export, router not ready) `studentIdString` is `undefined` →
  `parseInt(undefined)=NaN`. `getStudentNickname(NaN)` does `animals[NaN % len]` = `animals[NaN]` =
  `undefined`, then `undefined[locale]` → throw. Reproduced in isolation: `getStudentNickname(NaN)`
  and `(undefined)` both throw this exact message; `(1)` works.
- **Impact:** the page ultimately RECOVERS and renders (the solution preview works — `/scratch/show`
  shows the student's blocks; `loadSubmission` received). So this is NOT a lockout or a broken
  preview. But it is an uncaught render-time exception on a core teacher flow — pollutes error
  tracking (Sentry) and is a latent hard-break if an error boundary is added or timing shifts (e.g.
  slow device, direct link / refresh / bookmark). Fires on direct navigation & refresh.
- **Fix direction:** guard `getStudentNickname` against non-finite `studentId` (return a stable
  placeholder), or don't call `useStudentName` with a NaN id (guard in the page / the hook's memo).
- **Repro scripts:** `.devmock/probe-studentdetail.mts`, `.devmock/probe-detail-impact.mts`,
  `.devmock/nick-nan2.mjs`.
- **E2E test:** `e2e/tests/sessions/student-solution-detail.spec.ts` written on branch
  `bugfix/student-detail-nickname-nan` (off origin/main). NOTE: could not commit — 1Password SSH
  signing is failing (`failed to fill whole buffer`) while the user is AFK. The file is on disk;
  commit it once 1Password is unlocked. Per the no-bypass-signing rule I did NOT use --no-gpg-sign.
- **Adversarial review + fix:** delegated to a subagent (isolated worktree) — it reviews the bug and
  test critically and writes a minimal fix, uncommitted (signing blocked), for review when back.

### B1 — STATUS: confirmed real by adversarial subagent; fix ready (uncommitted, not pushed)
The subagent independently confirmed the bug (stronger evidence: the codebase already guards
`getIdOrNaN`/`isNaN` everywhere else — `studentId` is the lone unguarded consumer; anonymization
defaults to `showActualName:false` so the nickname branch IS hit on first render; no error boundary
exists + Sentry is wired = recurring Sentry pollution + latent white-screen if a boundary is added).
- **Fix (its choice, option a):** guard `getStudentNickname` with `if (!Number.isInteger(studentId)) return "";`
  — covers all 4 call sites (useStudentName, StudentName, StudentHeader, join), byte-identical output
  for every valid DB id.
- **Location:** separate git worktree `P:\hepvd\collimator\.claude\worktrees\agent-a67f9725fa5abf37a`,
  branch `fix/student-nickname-nan-guard` (off origin/main). Changes STAGED/UNCOMMITTED (1Password
  signing blocked), NOT pushed. Includes the fix + an improved E2E (`student-solution-detail.spec.ts`).
- **For the user:** review the diff there; commit once 1Password is unlocked. Not tsc/eslint-run
  (isolated worktree had no node_modules) — trivially type-safe, reasoned.

### B3 — Raw "Failed to fetch" shown to users on any data-load failure  ·  MEDIUM (understandability + i18n + robustness)
Under total API failure, no page hangs/blanks/crashes (good robustness — spinners resolve, no uncaught
errors). BUT every failed page shows the literal browser string **"Failed to fetch"** to the user.
- **Root cause:** `MultiSwrContent` renders errors via `<ErrorMessage error={error} />`, and
  `ErrorMessage.tsx` is just `{error.message}` — the raw `Error.message`. For network/fetch failures
  that's "Failed to fetch"; for others it's whatever the thrown error says. Untranslated (English
  shown to FR users) and technical. Appears on progress, session-detail, task-bank, etc.
- **Repro:** `.devmock/net-robustness.mts` (aborts `**/api/v0/**`, loads 4 pages) → all show
  "Failed to fetch".
- **Fix direction (needs a product decision on wording — PARKED):** `ErrorMessage`/`MultiSwrContent`
  should render a friendly, translated message (e.g. "Could not load data. Please check your
  connection and try again."), keeping the raw `error.message` for the console only. A regression
  E2E can assert the raw "Failed to fetch" is never shown; wording is yours to choose.
- **E2E demonstrator written:** `e2e/tests/robustness/friendly-fetch-error.spec.ts` on branch
  `bugfix/friendly-fetch-error-message` (off origin/main). Aborts the API, loads `/class`, asserts the
  body never contains "failed to fetch"/"networkerror"/"load failed". Fails on current code (the raw
  string leaks), passes once a friendly message is shown. UNCOMMITTED (1Password signing blocked),
  not pushed. Lints clean.

## New E2E coverage: Jupyter student flow (branch `test/jupyter-student-flow`)
The Jupyter app had **zero** e2e coverage (the committed `tasks/jupyter` fixture is a *generic*
notebook zip — `task.ipynb` only — which `loadTask` rejects with MissingRequiredFilesError, which is
why no spec ever used it).
- **New fixture** `e2e/tests/sessions/tasks/jupyter/crt-internal/task.zip` in the CRT-internal format
  the app actually consumes (`template.ipynb` + `student.ipynb` + `autograder.zip`, per
  `task-format.ts`). Built from the existing notebook. **Verified live**: a student joining a lesson
  with this task gets a 40-cell notebook rendered, zero loadTask errors.
- **New helper** `e2e/tests/task/jupyter-task-management.ts` → `createJupyterTaskViaApi`. The UI path
  is unusable in an automated browser: saving a Jupyter task runs otter-grader, needing a ready
  Pyodide kernel that never prepares headless (finding F3) — the save spins forever. The API path
  keeps the *student* flow (the point of the test) fully exercisable.
- **New spec** `e2e/tests/sessions/jupyter-solve-task.spec.ts`: anonymous student joins a lesson with
  a Jupyter task → the embedded JupyterLite notebook opens (120s budget for the lab to boot).
- **Status: VERIFIED PASSING.** Ran against a real Playwright stack
  (`playwright test tests/sessions/jupyter-solve-task.spec.ts --project=Desktop`) → **6 passed**
  (auth setup + both new tests), 1.7 min. Lints clean. Staged on `test/jupyter-student-flow`,
  uncommitted (1Password signing blocked).
- **Gotcha for whoever runs e2e next:** the dev stack's frontend build bakes the *http* mock-OIDC
  issuer, while the e2e suite needs the build from `yarn build:frontend` (https://localhost:3880,
  intercepted in-page). A first run failed in auth setup purely because the dev-flavour build was
  being served. Re-run `yarn build:frontend` (or `task dev:mock:build` for the dev stack) when
  switching between the two.

### B6 — SECURITY: a student can submit a solution into a session they never joined  ·  HIGH  ·  confidence: HIGH
A student authenticated for session A can POST a solution to **session B** and it is persisted and
attributed to them, polluting another lesson's data and teacher reports.
- **Verified end-to-end:** student 8 is an `AnonymousStudent` of **session 1 only** (SQL-confirmed).
  Using their token against session 2: `POST /classes/1/sessions/2/task/2/solutions/student` → **201**,
  and `StudentSolution(id=8, studentId=8, sessionId=2, taskId=2)` now exists — a row in a lesson they
  never joined. Repro: `.devmock/sec-student-scope.mts`.
- **Root cause:** `solutions.controller.ts::createStudentSolution` has **no authorization check**.
  `@StudentOnly()` only proves *some* student is authenticated; the handler then takes `sessionId`
  and `taskId` straight from the URL and `studentId` from the token and writes. The `classId` param
  is explicitly discarded (`_classId`). Every *read* path calls
  `authorizationService.canView...`/`canViewSession`; this write path calls nothing.
- **Blast radius — ESCALATED, it is CROSS-TENANT (verified):** the attack is not limited to the
  student's own class. Built a two-tenant fixture (admin owns class 1/session 1; teacher *Richard*
  owns a separate class 2/session 2) and had a student join **only the admin's lesson**. With that
  token: `POST /classes/2/sessions/2/task/2/solutions/student` → **201**, producing
  `StudentSolution(studentId=1, sessionId=2, taskId=2)` — work injected into a **different teacher's**
  class and lesson. Repro: `.devmock/sec-cross-tenant.mts`.
  So any person holding any share link (anonymous lessons self-serve) can write into *any* lesson in
  the entire installation by incrementing small integer ids. Teacher-owned reads stay protected
  (their class detail and their students' solutions were denied), so this is cross-tenant **data
  corruption / report pollution**, not privilege escalation — but the tenancy boundary is not enforced
  on this write path at all.
- **Also found (lower severity):** the same token can **read another session's detail**
  (`GET /classes/1/sessions/2` → 200), leaking a lesson's title/description/task list to a student who
  is not in it. `canViewSession` allows any student of the class; for an anonymous lesson the student
  is not a class member, so this deserves a second look.
- **Correctly denied** (so the important walls hold): other sessions' student solutions, their
  analyses, class detail, user list, and the task bank — all denied for the student token.
- **ADVERSARIAL REVIEW: CONFIRMED REAL, and worse than I reported.** A subagent independently traced
  every layer (RoleGuard, interceptors, the `AuthenticatedStudent` decorator, the service, the Prisma
  schema) and found no hidden check. Key additions from its review:
  - **Token acquisition is unauthenticated:** `POST /authentication/login/student/anonymous` is
    `@Public()`, so anyone with *any* anonymous-lesson share link gets a valid student token — no
    teacher involvement. That makes this effectively unauthenticated cross-tenant write.
  - **The endpoint is also an enumeration oracle:** the only constraint is the
    `sessionTask(sessionId, taskId)` connect, so an invalid pair 404s and a valid one 201s — the
    (session, task) id space of the whole installation is trivially walkable.
  - **Compute amplification:** each forged submission enqueues a background AST analysis.
  - **SIBLING BUG, MORE SEVERE — `POST /student-activity`:** same missing check, but `sessionId`/
    `taskId` come from the *request body* (no route param to validate) and it writes an unbounded
    batch in one transaction. Smoking gun: that controller already injects `AuthorizationService`
    and never calls it. (My own probe returned 400 on a malformed body — validation, not authz —
    so I had wrongly assumed it was protected.)
  - **The read-leak (`GET` another anonymous lesson) is BY DESIGN, not a second finding:**
    `canViewSession` admits students via `{ isAnonymous: true }`, which is load-bearing for the join
    page (a student arriving at lesson B's link while holding lesson A's token must read B to render
    it). Exposure is lesson metadata only. I've dropped it as a finding.
- **Fix (subagent's, NOT pushed):** branch `security/student-session-scope-authorization`, commit
  `a1e3aa82`, in worktree `..\agent-a95413f84365de236`. Adds `participatesInSession` +
  `isStudentOfSessionTask` to `authorization.service.ts` (anonymous-join OR class-membership,
  mirroring `tasks.service.ts`'s existing predicate), wires `canCreateStudentSolution` (incl. the
  previously-discarded `classId`) and `canTrackStudentActivities` (batch, deduped) → 403. Verified:
  tsc clean (one pre-existing unrelated error baselined), eslint clean, **jest 242 tests passing**
  (+8 new authorization unit tests). Playwright not run.
- **Critiques of my E2E that I accepted and fixed:** it tested only the weaker cross-*session* case
  (used the target's correct `classId`) — now rewritten to cross-*class*, which is the severe variant
  the discarded `classId` enables. Still open (noted for follow-up): no positive control asserting a
  student CAN still submit to their own lesson, no DB assertion that no row was written, and no
  coverage of the `/student-activity` sibling.

### B8 — SECURITY: any student could read ANY task's REFERENCE SOLUTIONS (the answer key)  ·  HIGH  ·  FIXED
A student authenticated for one anonymous lesson could read **any task in the installation** —
including another teacher's **private** task — and fetch its **reference solutions with the solution
files base64-encoded** (the answers).
- **Verified** (`.devmock/sec-student-reads.mts`, `.devmock/sec-refsol-content.mts`): student joined
  only the admin's lesson, probing teacher Richard's separate private task (`isPublic: false`,
  `creatorId: 10001`):
  - `GET /tasks/2` → 200 · `GET /tasks/2/download` → 200
  - `GET /tasks/2/with-reference-solutions` → **200**, `referenceSolutions[].solution` documented in
    `task-reference-solution.dto.ts` as *"The associated solution encoded in base64"*, plus `tests`.
  - `GET /classes/2/sessions/2/progress` (other teacher's lesson progress) → **200**
- **Root cause:** those endpoints are `@Roles([ADMIN, TEACHER, NonUserRoles.STUDENT])`
  (`tasks.controller.ts:164/188/225`) with **no per-object authorization** — no check that the task
  belongs to a lesson the student participates in, and no `isPublic` check. Read-side twin of B6.
- **Why it matters:** a student can pull the reference solution for the task they are being graded
  on (ids are small sequential integers), defeating assessment.
- **Matrix note:** the matrix blesses *Anyone · View/Download · Task · ✅* ("Anyone" = any
  authenticated user incl. students), so plain task view/download is intended; the answer key is not.
- **USER DECISION (2026-07-26): "students shouldn't be able to read reference solutions" → FIXED.**
  Branch `security/reference-solutions-not-student-readable`, commit `8714acc2` (not pushed):
  `@Roles([ADMIN, TEACHER, STUDENT])` → `@Roles([ADMIN, TEACHER])` on `findOneWithReferenceSolutions`.
  - **Safety check first:** all four consumers of `useTaskWithReferenceSolutions` are teacher/admin
    pages (`pages/task/[taskId]/{detail,reference-solutions}` + session-scoped counterparts); the
    student solve page uses only `useTask`/`useTaskFile`. No student flow regresses. tsc/eslint clean
    (remaining tsc errors are pre-existing, in vendored antlr grammars).
  - E2E `e2e/tests/sessions/reference-solutions-not-student-readable.spec.ts`: student → **403** for
    reference solutions, **plus a positive control** that they still get 200 for the task itself.
- **CORRECTION — the "progress leak" I reported is NOT a leak.** I initially listed
  `GET /classes/:c/sessions/:s/progress` → 200 on another teacher's lesson as part of this finding.
  On inspection `getSessionProgress` passes `student.id` to the service, so it returns **only the
  caller's own** progress; probing it against the other teacher's lesson returned
  `{"id":2,"taskProgress":[]}` — an empty payload, no other students' data. The 200 is the same
  by-design anonymous-lesson visibility as the session read. Withdrawn; no action.
- **STILL OPEN inside B8 (not fixed):** a student can read any task's metadata and file
  (`GET /tasks/:id`, `/tasks/:id/download`) regardless of participation. Arguably blessed by the
  matrix's *Anyone · View/Download · Task · ✅*, so left alone pending a decision.

### B7 — CRT-399's kernel guard is bypassed on the grading path  ·  MEDIUM  ·  confidence: MEDIUM-HIGH
Resolves the long-open **F2** ("kernel-select dialog appears despite CRT-399") from session 1, which I
could not previously explain and had parked as possibly headless-only.
- CRT-399 routes opens through `openTaskNotebook()` (`iframe-api.ts:192`), which awaits
  `waitForKernelSpecs()` first — and all five `iframe-api` call sites correctly use it.
- **But `command.ts:30` (`executeRunNotebookCommand`) calls `documentManager.open(...)` directly**,
  with no kernelspec wait. That is the grading path (`commands/grade.ts` → executes the student
  notebook before submitting it for grading), i.e. precisely the flow that was running when I observed
  the "Select Kernel" dialog listing `Python (Pyodide)` / `otter-session` / `No Kernel`.
- So the dialog is not purely a headless artifact: there is a real unguarded open. On a slow/cold
  kernel a user can plausibly hit the same picker.
- **Caveat kept:** I have not re-observed the dialog with a fix applied, and the headless environment
  exaggerates kernel slowness, so I rate this MEDIUM-HIGH rather than certain. A real-browser check
  (still worth 2 minutes on your machine) would settle it.
- **Fix direction:** route `executeRunNotebookCommand`'s open through the same guard (or await
  `waitForKernelSpecs()` before it), so every notebook open in the extension is covered. Note the
  guard waits for a *kernelspec to be registered*, not for a *ready kernel* — which is a different
  (and weaker) property than what B5 needs.

### B5 — Saving a Jupyter task can hang forever with no timeout and no feedback  ·  MEDIUM-HIGH  ·  confidence: HIGH
Originally written off as a "headless-only artifact" (F3). On the user's challenge I re-examined it:
**the hang is application behaviour, not a test-environment quirk.** Headless Chromium merely makes
a slow/never-ready Pyodide kernel *reproducible*; the same stall is what a teacher on a slow machine,
a cold CDN, or a flaky network would hit.
- **What's missing — no bound anywhere along the save path:**
  1. `utils.ts::setupKernel` — `while (!kernel) { await new Promise(...kernelChanged...) }`: waits for
     a kernel **forever**, no timeout, no abort.
  2. `utils.ts::waitForKernelToBePrepared` — `await kernel[preparedKey]`: awaits a promise that is
     only ever resolved by `setKernelIsPrepared`. If preparation never completes, it never settles.
  3. `notebook-runner-state.ts:196` — another unbounded `while (!sessionContext.session?.kernel)`.
  4. The RPC layer (`iframe-rpc-api.ts::sendRequest`) has **no request timeout** — a request whose
     response never arrives stays pending forever.
  5. The UI (`TaskModal` save handler) awaits `onSave` with no timeout, so the spinner spins
     indefinitely: no error, no cancel, no way out except reloading the page (**a lockout**).
- **The codebase already knows how to do this** — Scratch's `getSubmission` bounds execution with
  `vm.crtConfig.maximumExecutionTimeInMs` + a grace period and raises `TimeoutExceededError`; Jupyter's
  own `notebook-runner-state.ts:264` bounds *file reads* with a timeout. Only the kernel-wait path is
  unbounded. So this is an inconsistency/gap, not a deliberate design.
- **Impact:** teacher clicks Save on a Jupyter task → infinite spinner, no error message, work not
  saved, only escape is a page reload (which loses the edit). Fits the "flows where a user can get
  locked" scope directly.
- **Fix direction (PARKED — needs a product call on the budget):** bound the kernel wait (and ideally
  the RPC) with a timeout that surfaces a translated error + lets the user retry/cancel, mirroring
  Scratch's `maximumExecutionTimeInMs` pattern. The right timeout value (kernel boot can legitimately
  take tens of seconds on first load) is the decision to make.
- **Note:** an E2E for this would need to simulate a never-ready kernel; the headless environment
  reproduces it naturally, so `.devmock/t2b-jupyter-save.mts` is the current demonstrator (modal never
  closes; logs stall at `Waiting for session context to be ready...`).

### B4 — CONFIRMED: a FINISHED lesson still accepts new students and new submissions  ·  MEDIUM  ·  confidence: HIGH
With the lesson properly transitioned `CREATED → start → ONGOING → finish → **FINISHED**`, a brand-new
anonymous student can still **join (201)** and **submit a solution (201)**.
- **Repro:** `.devmock/probe-b4.mts` → `start -> 201 ONGOING | finish -> 201 FINISHED |
  anonymous JOIN of FINISHED lesson -> 201 ALLOWED | SUBMIT to FINISHED lesson -> 201 ALLOWED`.
- **Root cause:** `POST /authentication/login/student/anonymous` checks only `session.isAnonymous`,
  never `session.status`; the solution-creation path has no status check either. The status machine
  IS enforced for teacher transitions (`changeStatusByIdAndClass` restricts FINISHED to
  ONGOING/PAUSED/FINISHED — which is why a `finish` on a CREATED session correctly 404s), so the
  concept exists and is simply not applied to student access.
- **Impact:** "finishing" a lesson does not actually close it — late/absent students can still join
  and submit afterwards, and their work lands in the teacher's reports after the lesson was
  concluded. Data-integrity/UX rather than a security hole (they still need the share link).
- **REFRAMED after further digging — this is an UNIMPLEMENTED FEATURE, not a broken guard:**
  - The **frontend contains no session-lifecycle UI at all**: no start/pause/finish control
    (`SessionActions.tsx` has none) and no status column/badge (`SessionList.tsx` has none). The only
    frontend references to `SessionStatus` are in auto-generated MSW mock files — **zero hand-written
    code** uses it.
  - Verified end-to-end with the session set to FINISHED in the DB: the teacher session list and
    progress page show **no indication whatsoever** ("finished/closed" appears nowhere), and both a
    brand-new student (join → 201) and an already-joined student (submit → 201) carry on unaffected.
  - So the backend lifecycle (`start`/`pause`/`finish` + the CREATED→ONGOING→PAUSED→FINISHED machine)
    is **dead code from the product's perspective**: unreachable from the UI, unenforced for students.
- **PARKED (product decision):** either (a) finish the feature — expose start/pause/finish + a status
  badge, and enforce status on student join/submit; or (b) remove the backend lifecycle as dead code.
  Not a snap call: it decides whether "closing a lesson" becomes a real capability. An E2E
  demonstrator can be written once the intended semantics are chosen.

### B4 (superseded — original inconclusive note) — session status may not gate student access
`POST /authentication/login/student/anonymous` checks only `session.isAnonymous`, **not**
`session.status` (CREATED/ONGOING/PAUSED/FINISHED), and no status check appears in the solution
submission path either. A probe showed an anonymous student CAN log in and submit — **but** the
teacher's `POST .../finish` returned 404 in that probe, so the session was still `CREATED`, meaning
the probe did NOT actually test a finished lesson. **Inconclusive.** Follow-up: find the correct
status-transition endpoint/flow (the controller has start/pause/finish at
`sessions.controller.ts:173/207/232`), set the session to FINISHED, then re-probe join + submit.
If students can join/submit to a finished lesson, that is a real data-integrity/UX issue worth a
ticket; if the status transitions block it, close this out.

## Deliverables — COMMITTED (1Password recovered on retry). Nothing pushed; origin/main untouched.
| Branch | Commit | Contents |
|---|---|---|
| `test/jupyter-student-flow` | `0b06b779` | Jupyter student-flow E2E + CRT-internal fixture + API helper. **Verified: 6 passed** on a real stack |
| `bugfix/student-cross-session-submission` | `90efa08b`, `941a1dc7` | **B6 security** E2E (cross-class + positive control). **Verified failing** for the right reason: `Expected 403, Received 201` |
| `security/student-session-scope-authorization` (worktree `..\agent-a95413f84365de236`) | `a1e3aa82` | Subagent's **B6 fix** (+8 unit tests; jest 242 passing) — review then merge |
| `bugfix/student-detail-nickname-nan` | `d21a1397` | B1 regression E2E |
| `fix/student-nickname-nan-guard` (worktree `..\agent-a67f9725fa5abf37a`) | uncommitted | Subagent's B1 **fix** + its own E2E — review then commit |
| `bugfix/friendly-fetch-error-message` | `46b0ae73` | B3 regression E2E |
| `feature/dev-mock-stack` | pushed | dev stack; these `.planning` docs live here uncommitted |

## Priority order for review (my assessment)
1. **B6** (security, cross-tenant write + the `/student-activity` sibling) — fix ready & unit-tested.
2. **B5** (Jupyter save hangs forever → user locked, no error) — needs a timeout-budget decision.
3. **B1** (uncaught TypeError on every student-detail direct load) — fix ready.
4. **B4** (session lifecycle unimplemented) / **B3** (raw "Failed to fetch") — both need a product call.
5. **B2** (stray console.log), **T1** (missing FR translation) — trivial.

## Docs check (user suggestion) — no discrepancies found ✅
All 9 `task ...` commands in `docs/overview/developer-setup-guide.md` exist in `Taskfile.yml`.
The e2e doc's description of the webServer/seeding flow matches `playwright.config.ts` +
`scripts/e2e-testing.ts`.

## Parked decisions (need the user)
- **B3 message wording**: what friendly, translatable text to show on data-load failure? (reversible;
  E2E asserts only that the raw string is gone, so wording can be chosen freely.)
- **D2 (from PERMISSION-MATRIX-RESULTS)**: is session copy-to-same-class meant to be blocked (spec ❌)
  or allowed (the Anansi remark reads as wanting it allowed)? Determines fix vs matrix update.

### B2 — Leftover debug `console.log` in production error handling  ·  LOW (hygiene)
`frontend/src/errors/errorMessages.ts:38` `getErrorMessageDescriptor` starts with
`console.log("Getting error message for error code:", errorCode)` — fires on every handled API
error in production. Active code (not dead). Trivial fix: delete the line. Not covered by any open PR.

### T1 — `ApiError.USER_OWNS_CLASSES` has no French translation  ·  LOW (i18n)
Only EN key missing from the compiled FR locale (`content/compiled-locales/fr.json`). A French admin
who deletes a user owning classes gets the English fallback (`defaultMessage`) instead of French.
The other 4 ApiError codes are translated. Unmapped error codes fall back to a clear generic message
(`GENERIC_ERROR`), so no raw codes leak to users — error understandability is otherwise fine.

### Noted, already covered (no action)
- `LessonList.tsx` has stub dropdown items labeled "Action 2"/"Something else" whose only handler is
  `console.log(...)`. But `/lesson` is **unreachable** (its nav entry is commented out in
  `CrtNavigation.tsx:61`), and open **PR #611** (CRT-341, remove Lesson feature) deletes
  `components/lesson/LessonList.tsx`. Dead code, already being removed — no new fix.
- `apps/scratch/src/pages/_app.tsx` `dangerouslySetInnerHTML` = the static iframe-message-buffering
  script (constant string, not user input) → no XSS. Cleared.

### Merged-fix verification (all 7 confirmed in my build via git ancestry)
- **CRT-397** (locale reload keeps work): behaviorally verified earlier (`s5`) — restored + markerFound. ✓
- **CRT-439** (anon progress identities): behaviorally verified (`s1`) — ad-hoc names only. ✓
- **CRT-363** (crtMode not mode): build uses `crtMode=`, no bare `mode=solve/edit`. ✓ (code-level)
- **CRT-431** (title clamp): build ships `WebkitLineClamp`/`lineClamp`; no horizontal overflow observed.
  ✓ (code-level; full behavioral clamp check deprioritized — low risk, CSS present)
- **CRT-399, CRT-401, CRT-388**: not re-verified behaviorally this session (jupyter-kernel headless
  flakiness for 399; UI-form for 401; scratch-drag for 388). Code shipped. See F2 caveat for 399.
- **CRT-435** (progress polling) is **UNMERGED** (#625 OPEN, `live-refresh.ts` not on main). A live
  test correctly showed the progress page does NOT auto-update without refresh — i.e. it confirms the
  pre-fix behavior #625 addresses, NOT a regression.

### Student-activity vs. preview discrepancy check — NO DISCREPANCY FOUND ✅
The user specifically asked whether student *activities* and the teacher-visible *previews* diverge.
Ran the missing flow (a student who **edits over time**, not just submits):
- A student joined and dragged a `move 10 steps` block from the palette into the workspace.
- Result: `StudentActivity` +1 (`TASK_APP_ACTIVITY`), solutions unchanged (6) — activities are
  emitted on block create/change/delete/move/green-flag (`scratch-student-activities/senders/`),
  each carrying a `solutionHash`.
- **Data integrity intact:** the activity's `solutionHash` resolves to a real `Solution` row AND a
  `SolutionAnalysis` row (verified by SQL join) — so nothing is orphaned.
- **Teacher visibility correct:** `current-analyses` returns an analysis for that student, and the
  student-detail preview renders the original task blocks **plus the newly dragged `move 10 steps`** —
  i.e. the preview faithfully reflects what the student actually did.
- Conclusion: previews and activities agree. The earlier "StudentActivity = 0" observation was simply
  because the e2e submission helper posts final solutions only and never edits.

### Not-a-bug (checked, in scope, cleared)
- **Solution previews ARE visible** (`/scratch/show` renders the student's code blocks read-only).
  `canvas=0` is expected in show-mode (blocks, not stage). Preview receives `loadSubmission`. ✅
- **Analysis pipeline works**: 3 submissions → 3 SolutionAnalysis rows, 0 failed, via the piscina
  worker + cron. Progress/analysis/dissimilar screens all render.
- **`StudentActivity`=0** in this flow — the e2e submission path posts final solutions, not
  incremental activities. So the "activities vs previews" discrepancy check needs a flow that emits
  activities (student editing over time), not just final submits. Parked as a follow-up flow.
