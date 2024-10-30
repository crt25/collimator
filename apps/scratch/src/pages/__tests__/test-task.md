The file `test-task.zip` is used in `Edit.spec.ts` to test whether we can load a task.

All blocks but `motion_movesteps`, `motion_turnright` and `motion_goto` are disabled.

- `motion_movesteps` can be used 7 times in total and is already used once by the task.
- `motion_turnright` can be used once and is used once by the task.
- `motion_goto` can be used an arbitrary amount and has not been used yet.

The tasks blocks cannot be edited / are frozen. The same task where the initial blocks are not frozen is suffixed with `-editable`;