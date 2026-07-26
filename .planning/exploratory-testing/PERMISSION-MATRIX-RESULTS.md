# Permission matrix — API-layer probe results

**Base:** `main` @ `c3d63d5c`. **Layer tested:** backend API (`http://localhost:3998/api/v0`),
the decisive enforcement layer. **Method:** `e2e/.devmock/perm-matrix.mts` (+ `perm-user-update.mts`,
`perm-task.mts`) driving real requests as saved admin/teacher tokens; classified against
[ACCESS-RIGHTS-MATRIX.md](ACCESS-RIGHTS-MATRIX.md).

Result codes below reflect **corrected** runs (the first pass had 5 false FLAGs from malformed
request bodies hitting DTO validation `400` before the authz check — re-probed with valid bodies).

## Coverage status
Round 1 (simple cells) + Round 2 (state-dependent cells) complete. All security-critical cells
verified. Remaining un-probed: Session/Lesson update sub-states ("remove tasks / change sharing
type once students enrolled" → ❌) and admin-delete-user *tasks*-only cascade (✅, orphaning) — both
low-risk and noted at the end.

**Two deviations found (D1, D2); everything else matches spec.**

Note on denial codes: task in-use denial = **409** (`TaskInUseByClassOrLessonWithStudentsError`);
delete-user-with-classes = **409** (`UserOwnsClassesError`); ownership/role denial = **403**;
missing/expired token = **401**. The probe classifier treats 401/403/409 (and 400 for copy) as DENY.

## Enforced correctly (API matches spec)

| Object | Role | Cell | Expected | Got |
|---|---|---|---|---|
| User | Teacher | Create | DENY | 403 ✅ |
| User | Teacher | View self | ALLOW | 200 ✅ |
| User | Teacher | View not-self | DENY | 403 ✅ |
| User | Teacher | Update self, same type | ALLOW | 200 ✅ |
| User | Teacher | Update self, change type→ADMIN | DENY | 403 ✅ |
| User | Teacher | Update not-self | DENY | 403 ✅ |
| User | Teacher | Delete | DENY | 403 ✅ |
| User | Admin | List / View any | ALLOW | 200 ✅ |
| Class | Teacher | List (own only) | ALLOW | 200 ✅ |
| Class | Teacher | View not-my-class | DENY | 403 ✅ |
| Class | Teacher | Update not-my-class | DENY | 403 ✅ |
| Class | Teacher | Delete not-my-class | DENY | 403 ✅ |
| Class | Teacher | View my-class | ALLOW | 200 ✅ |
| Class | Admin | View teacher's class | ALLOW | 200 ✅ |
| Task | Teacher | Create private | ALLOW | 201 ✅ |
| Task | Teacher | Create public | DENY | 403 ✅ ("Only admins can create public tasks") |
| Task | Teacher | View any | ALLOW | 200 ✅ |
| Session | Teacher | List not-my-class | DENY | 403 ✅ |
| Session | Teacher | Create in not-my-class | DENY | 403 ✅ |
| Session | Teacher | View not-my-class | DENY | 403 ✅ |
| StudentSolution | Teacher | List not-own-session | DENY | 403 ✅ |
| StudentSolution | Teacher | Delete | DENY | 403 ✅ |
| Task | Admin | Update private, no students | ALLOW | 200 ✅ |
| Task | Admin | Update public own, no students | ALLOW | 200 ✅ |
| Task | Admin | Update private, WITH students | DENY | 409 ✅ |
| Task | Admin | Delete private, no students | ALLOW | 200 ✅ |
| Task | Admin | Delete private, WITH students | DENY | 409 ✅ |
| Task | Teacher | Update own, no students | ALLOW | 200 ✅ |
| Task | Teacher | Update own → make public | DENY | 403 ✅ |
| Task | Teacher | Update own, WITH students | DENY | 409 ✅ |
| Task | Teacher | Update not-own | DENY | 403 ✅ |
| Task | Teacher | Delete own, WITH students | DENY | 409 ✅ |
| Task | Teacher | Delete not-own | DENY | 403 ✅ |
| Task | Teacher | Delete own, no students | ALLOW | 200 ✅ |
| StudentSolution | Student | View OWN submission | ALLOW | 200 ✅ |
| StudentSolution | Student | View OTHER student's submission | DENY | 403 ✅ **(isolation enforced)** |
| Session | Admin | Copy → other class | ALLOW | 201 ✅ |
| User | Admin | Delete user with no links | ALLOW | 200 ✅ |
| User | Admin | Delete user linked to a class | DENY | 409 ✅ (UserOwnsClassesError) |

## Deviations & questions

### D1 — Teacher can reach List Users (backend-gap)  ·  severity: MEDIUM  ·  confidence: HIGH
Matrix: **Teacher · List · User · ❌**. Actual: `GET /users` as a teacher → **200**, returning a
one-element array containing only the teacher themselves.
- **Root cause:** `GET /users` (`users.controller.ts`, `findAll`) has **no `@Roles`/`@AdminOnly`**,
  so the global `RoleGuard` default (`[ADMIN, TEACHER]`) admits teachers; the service then scopes
  the result to self. Contrast `POST`, `DELETE`, `POST /:id/registration`, which are `@AdminOnly()`.
- **Interpretation:** a List that returns only yourself is effectively a View-self, but the *endpoint*
  is reachable where the spec says it should be denied — and the UI surfaces this as the full
  "User Manager" page with a **Create User** button (which then 403s on submit). This is the API
  confirmation of finding F5.
- **Fix direction:** add `@AdminOnly()` to `findAll` (and have the UI hide the User Manager nav +
  Create-User affordance for teachers). Verify no teacher-facing feature relies on `GET /users`.

### D2 — Session/Lesson can be copied into its own class  ·  severity: MEDIUM  ·  confidence: HIGH
Matrix: **Copy · source class → itself · ❌** (for both Admin and Teacher; Anansi remark: "as-is I
can't have a 'test' lesson, then use it to create the 'real' lesson" — the ❌ is the intended state).
Actual: `POST /classes/:classId/sessions/copy {sourceSessionId}` where the source session already
lives in `:classId` → **201**, a duplicate session is created in the same class.
- **Verified:** admin copy session 1 (class 1) → class 1 → 201, new session id 10 created; teacher
  copy own session (class 2) → class 2 → 201. Role-independent.
- **Root cause:** `sessions.controller.ts::copy` checks `canCreateSession(target)` and
  `canViewSession(source)` — both pass for the owner — but never checks that the **source session's
  class ≠ the target class**. No such guard exists in the controller or `sessionsService.copy`.
- **Interpretation caveat:** the Anansi remark reads as a *lament* about the restriction, so the
  team may actually WANT self-copy allowed. Either way the code doesn't match the current spec
  (Desired = ❌). Worth confirming intent before fixing — if self-copy should be allowed, update the
  matrix; if not, add a source-class ≠ target-class guard.
- Repro: `.devmock/perm-copy-deluser.mts`, `.devmock/perm-teacher-copyself.mts`.

### Q1 — "Anyone View/Download Task" requires authentication  ·  RESOLVED: not a deviation
Matrix lists **Anyone · View/Download · Task · ✅**. Unauthenticated `GET /tasks/:id`,
`/tasks/:id/download`, `/tasks` all → **401** (endpoints allow `[ADMIN, TEACHER, STUDENT]`, not
`UNAUTHENTICATED`).
- **Resolution (user, 2026-07-25):** "Anyone" means *any authenticated user (incl. students)*, not
  truly public. The 401-for-unauthenticated behavior is therefore **correct**; closed, no change.

## Still un-probed (low-risk remainder)
- **Session/Lesson Update sub-states** — once a session has students: "add tasks / change name/desc"
  → ✅ vs "remove tasks / change sharing type" → ❌. Needs a with-students session and PATCHes that
  toggle each sub-field; the harness can now build the with-students fixture (SQL-inserted
  `AnonymousStudent`), so this is straightforward next.
- **Admin Update/Delete public task, "someone else's class/session"** branch (❌) — needs a public
  task used in another teacher's session.
- **Admin Delete User linked to tasks only** (✅, public tasks orphaned / private removed) — the
  cascade-orphaning behavior, distinct from the class-link block (already verified as 409).

All are non-security-critical (they gate UX/data-integrity edge cases, not cross-user access). The
cross-user isolation and in-use protections — the parts that matter for safety — are all verified.

## Harness caveats (so results are trustworthy)
- **Tokens expire (~1h).** A whole probe returning 401 = stale `*-state.json`; refresh with
  `.devmock/relogin.mjs` before re-running. (One run was invalidated this way and re-done.)
- **This backend validates request bodies BEFORE authorizing** — a malformed body yields 400, not
  the authz verdict. Every probe must send a schema-valid body or the result is meaningless (5
  false FLAGs in round 1 came from this).
- **psql echoes the `INSERT 0 1` tag even under `-tA`;** capture `RETURNING` ids as the first line
  only (`-q` + `.split(\n)[0]`), or a follow-up statement is silently malformed (caused 2 false
  FLAGs before it was caught by verifying the row actually existed).
