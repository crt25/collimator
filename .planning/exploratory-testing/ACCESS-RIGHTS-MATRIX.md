# Access-rights matrix (source of truth)

Transcribed from `access-rights-matrix.xlsx` (provided by the user, HEP/Anansi).
The "Desired" column equals "Allowed" for every row, so the two agree; this is the
intended spec to test against. "Anansi Remarks" preserved where they clarify a rule.

Legend: ✅ allowed · ❌ denied.

## User
| Role | Action | State | Linked with | Expected |
|---|---|---|---|---|
| Admin | Create | - | - | ✅ |
| Admin | List | - | - | ✅ |
| Admin | View | Any user | - | ✅ |
| Admin | Update | Any user | - | ✅ |
| Admin | Delete | Any user | nothing | ✅ |
| Admin | Delete | Any user | class or lessons | ❌ (create dummy user, reassign classes, then delete) |
| Admin | Delete | Any user | tasks | ✅ (public tasks orphaned; private tasks removed) |
| Teacher | Create | - | - | ❌ |
| Teacher | List | - | - | ❌ |
| Teacher | View | Self | - | ✅ |
| Teacher | View | Not self | - | ❌ |
| Teacher | Update | Self, same type | - | ✅ |
| Teacher | Update | Self, change type | - | ❌ |
| Teacher | Update | Not self | - | ❌ |
| Teacher | Delete | - | - | ❌ |

## Class
| Role | Action | State | Linked with | Expected |
|---|---|---|---|---|
| Admin | Create | - | - | ✅ |
| Admin | List | Any class | - | ✅ |
| Admin | View | Any class | - | ✅ |
| Admin | Update | Any class | Lesson or Class | ✅ |
| Admin | Delete | Any class | Lesson/Task/Students | ✅ (cascades soft-delete: lessons, lessonTasks, students, solutions/activity, analyses) |
| Teacher | Create | - | - | ✅ |
| Teacher | List | My class | - | ✅ |
| Teacher | List | Not my class | - | ❌ |
| Teacher | View | My class | - | ✅ |
| Teacher | View | Not my class | - | ❌ |
| Teacher | Update | My class | Lesson or Task | ✅ |
| Teacher | Update | Not my class | Lesson or Task | ❌ |
| Teacher | Delete | My class | Lesson/Task/Students | ✅ (same cascade as admin) |
| Teacher | Delete | Not my class | - | ❌ |

## Lesson  (a "Lesson" = a Session in the code/API)
| Role | Action | State | Linked with | Expected |
|---|---|---|---|---|
| Admin | Create | In any class | - | ✅ |
| Admin | List | In any class | - | ✅ |
| Admin | View | Any lesson | - | ✅ |
| Admin | Update | Any lesson | nothing | ✅ |
| Admin | Update | Any lesson | tasks | ✅ |
| Admin | Update | change name/description, add tasks | students | ✅ |
| Admin | Update | remove tasks, change sharing type | students | ❌ |
| Admin | Copy | source class → other class | - | ✅ |
| Admin | Copy | source class → itself | - | ❌ |
| Admin | Delete | Any lesson | - | ✅ (cascade soft-delete) |
| Teacher | Create | In my class | - | ✅ |
| Teacher | Create | Not my class | - | ❌ |
| Teacher | List | In my class | - | ✅ |
| Teacher | List | Not my class | - | ❌ |
| Teacher | View | My lesson | - | ✅ |
| Teacher | View | Not my lesson | - | ❌ |
| Teacher | Update | My lesson | nothing | ✅ |
| Teacher | Update | My lesson | tasks | ✅ |
| Teacher | Update | change name/description, add tasks | students | ✅ |
| Teacher | Update | remove tasks, change sharing type | students | ❌ (a student may have enrolled/started) |
| Teacher | Update | Not my lesson | - | ❌ |
| Teacher | Delete | My lesson | students or tasks | ✅ (cascade soft-delete) |
| Teacher | Delete | Not my lesson | - | ❌ |
| Teacher | Copy | my class → my other class | - | ✅ |
| Teacher | Copy | my class → itself | - | ❌ |
| Teacher | Copy | not my class → any / any → not my class | - | ❌ |
| Student | View | Enrolled in class | - | ✅ |
| Student | View | Anonymous lesson | - | ✅ |
| Student | View | Not enrolled, not anonymous | - | ❌ |

## Task
| Role | Action | State | Linked with | Expected |
|---|---|---|---|---|
| User (any authed) | Create | - | - | ✅ |
| Admin | Create | Public or private | - | ✅ |
| Admin | List | Any task | - | ✅ |
| Admin | View | Any task | - | ✅ |
| Admin | Update | Private task | class/session without students | ✅ |
| Admin | Update | Private task | class/session with students | ❌ |
| Admin | Update | Public task | own class/session without students | ✅ |
| Admin | Update | Public task | own w/ students OR anyone else's | ❌ |
| Admin | Delete | Private task | without students | ✅ (cascade: ref solutions, student solutions+analyses, activity) |
| Admin | Delete | Private task | with students | ❌ |
| Admin | Delete | Public task | own without students | ✅ (cascade) |
| Admin | Delete | Public task | own w/ students OR anyone else's | ❌ |
| Teacher | Create | Private | - | ✅ |
| Teacher | Create | Public | - | ❌ |
| Teacher | List | Own and public | - | ✅ |
| Teacher | View | Any task | - | ✅ |
| Teacher | Update | Own task | without students | ✅ |
| Teacher | Update | Own task | with students | ❌ |
| Teacher | Update | Not own task | - | ❌ |
| Teacher | Update | Own task, make public | - | ❌ |
| Teacher | Delete | Own task | without students | ✅ (cascade) |
| Teacher | Delete | Own task | with students | ❌ |
| Teacher | Delete | Not own task | - | ❌ |
| Anyone | View | Any task | - | ✅ |
| Anyone | Download | Any task | - | ✅ |

## StudentSolution
| Role | Action | State | Expected |
|---|---|---|---|
| Admin | List | Any session | ✅ |
| Admin | View/Download | Any solution | ✅ |
| Admin | Set isReferenceSolution | Any solution | ✅ |
| Admin | Delete | Any solution | ✅ (cascade: solution analysis) |
| Teacher | List | Own class's session | ✅ |
| Teacher | List | Not own class's session | ❌ |
| Teacher | View/Download | Own class's student | ✅ |
| Teacher | View/Download | Not own class's student | ❌ |
| Teacher | Set isReferenceSolution | Own class's session | ✅ |
| Teacher | Set isReferenceSolution | Not own class's session | ❌ |
| Teacher | Delete | - | ❌ |
| Student | Create | In enrolled/anonymous session | ✅ |
| Student | View/Download | Own submission | ✅ |
| Student | View/Download | Other's submission | ❌ |

## Testing notes
- "Lesson" in this matrix = **Session** in the codebase (`/api/v0/classes/:id/sessions`).
- The distinction we already flagged (F5): a *scoped* affordance may be allowed at the API but the
  UI shouldn't necessarily offer it. Probe each cell at BOTH layers and classify:
  enforced / UI-leak-only / backend-gap / over-restricted.
- "with/without students" states require a session that has (or lacks) an enrolled student —
  build both during setup.
