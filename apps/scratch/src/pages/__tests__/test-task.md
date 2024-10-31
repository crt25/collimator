The file `test-task.zip` is used in `Edit.spec.ts` and `Solve.spec.ts` to test the editing and solving functionality.

The CRT config looks as follows:

```json
{
  "allowedBlocks": {
    "motion_movesteps": 7,
    "motion_turnright": 2,
    "motion_goto": -1
  },
  "taskBlockIds": {
    "*t~VMcxLD[(lt8Ja;s#-": "frozen",
    "iY}I[=PNCjG}GzJS1G/X": "appendable"
  }
}
```

The main actor has the following blocks:

```json
{
  "DMA4vbfmH7Ag=.YTb639": {
    "opcode": "motion_movesteps",
    "next": "@Z24?:3gFhIy;D;=NXM*",
    "parent": null,
    "inputs": { "STEPS": [1, [4, "10"]] },
    "fields": {},
    "shadow": false,
    "topLevel": true,
    "x": 181,
    "y": 91
  },
  "@Z24?:3gFhIy;D;=NXM*": {
    "opcode": "motion_turnright",
    "next": null,
    "parent": "DMA4vbfmH7Ag=.YTb639",
    "inputs": { "DEGREES": [1, [4, "15"]] },
    "fields": {},
    "shadow": false,
    "topLevel": false
  },
  "*t~VMcxLD[(lt8Ja;s#-": {
    "opcode": "motion_glideto",
    "next": "!cHbf-/Rw+|=pKw:^+M+",
    "parent": null,
    "inputs": {
      "SECS": [1, [4, "1"]],
      "TO": [1, ",Rsto^{$piJZzu??#l0o"]
    },
    "fields": {},
    "shadow": false,
    "topLevel": true,
    "x": 90,
    "y": 297
  },
  ",Rsto^{$piJZzu??#l0o": {
    "opcode": "motion_glideto_menu",
    "next": null,
    "parent": "*t~VMcxLD[(lt8Ja;s#-",
    "inputs": {},
    "fields": { "TO": ["_random_", null] },
    "shadow": true,
    "topLevel": false
  },
  "!cHbf-/Rw+|=pKw:^+M+": {
    "opcode": "motion_pointtowards",
    "next": "ToJ{`}I6tfwV9|hO3*]x",
    "parent": "*t~VMcxLD[(lt8Ja;s#-",
    "inputs": { "TOWARDS": [1, "W7pAJc~Abg+v[CmyNh@}"] },
    "fields": {},
    "shadow": false,
    "topLevel": false
  },
  "W7pAJc~Abg+v[CmyNh@}": {
    "opcode": "motion_pointtowards_menu",
    "next": null,
    "parent": "!cHbf-/Rw+|=pKw:^+M+",
    "inputs": {},
    "fields": { "TOWARDS": ["_mouse_", null] },
    "shadow": true,
    "topLevel": false
  },
  "iY}I[=PNCjG}GzJS1G/X": {
    "opcode": "motion_pointindirection",
    "next": "}b^?@S!_A`|Lu]o_[aP.",
    "parent": null,
    "inputs": { "DIRECTION": [1, [8, "90"]] },
    "fields": {},
    "shadow": false,
    "topLevel": true,
    "x": 614,
    "y": 243
  },
  "}b^?@S!_A`|Lu]o_[aP.": {
    "opcode": "motion_glidesecstoxy",
    "next": "H{{dc|4tE3KZ#:7DEV7G",
    "parent": "iY}I[=PNCjG}GzJS1G/X",
    "inputs": {
      "SECS": [1, [4, "1"]],
      "X": [1, [4, "0"]],
      "Y": [1, [4, "0"]]
    },
    "fields": {},
    "shadow": false,
    "topLevel": false
  },
  "H{{dc|4tE3KZ#:7DEV7G": {
    "opcode": "control_repeat",
    "next": "6eyuS~n}^ivm:]/DnM$+",
    "parent": "}b^?@S!_A`|Lu]o_[aP.",
    "inputs": { "TIMES": [1, [6, "10"]] },
    "fields": {},
    "shadow": false,
    "topLevel": false
  },
  "6eyuS~n}^ivm:]/DnM$+": {
    "opcode": "motion_gotoxy",
    "next": null,
    "parent": "H{{dc|4tE3KZ#:7DEV7G",
    "inputs": { "X": [1, [4, "0"]], "Y": [1, [4, "0"]] },
    "fields": {},
    "shadow": false,
    "topLevel": false
  },
  "ToJ{`}I6tfwV9|hO3*]x": {
    "opcode": "control_repeat",
    "next": null,
    "parent": "!cHbf-/Rw+|=pKw:^+M+",
    "inputs": { "TIMES": [1, [6, "10"]] },
    "fields": {},
    "shadow": false,
    "topLevel": false
  }
}
```
