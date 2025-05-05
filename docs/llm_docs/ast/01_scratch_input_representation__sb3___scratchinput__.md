# Chapter 1: Scratch Input Representation (SB3 / ScratchInput)

Welcome to the `ast` project! We're excited to have you here. This project helps us understand and work with Scratch projects in a structured way.

Imagine you have a cool game you built in Scratch. You save it, and it becomes a `.sb3` file. But what *is* that file, really? How does Scratch remember where all your sprites are, what costumes they have, and what code blocks make them move and talk?

Our first step is to look inside that `.sb3` file. We need a way to represent *exactly* what Scratch saved, right down to the nitty-gritty details. This precise representation is what we call **`ScratchInput`**.

## What is `ScratchInput`?

Think of a `.sb3` file like a zip package. Inside, there's a special file usually called `project.json`. This JSON file contains *everything* about your Scratch project:

*   The **Stage** (the background) and all the **Sprites** (characters/objects).
*   All the colorful **Blocks** you snapped together to make code.
*   Any **Variables** (like `score`) or **Lists** you created.
*   Information about **Costumes** (what sprites look like) and **Sounds**.

**`ScratchInput`** is simply our way of representing this `project.json` data inside our code. We use TypeScript types to define the exact structure, making it easier and safer for our program to read and understand the raw Scratch project data.

**Analogy:** Imagine `ScratchInput` as the original, detailed architectural blueprint for a specific house (your Scratch project), drawn exactly the way the original architect (Scratch) designed it.

It's the *starting point* for everything else we do in this project. We first read the Scratch project into this `ScratchInput` format before doing anything fancier.

## Key Parts of `ScratchInput`

The `ScratchInput` structure mirrors the `project.json` file. Here are the main pieces:

1.  **`meta`**: Contains some technical details, like the Scratch version used to save the project.
2.  **`targets`**: This is a list containing the Stage and all the Sprites.
    *   The **first** item in the `targets` list is *always* the Stage.
    *   All **other** items are the Sprites.
3.  **Inside each Target (Stage or Sprite):**
    *   **`blocks`**: A collection of *all* the code blocks belonging to that target. Each block has details like its type (`opcode`), what blocks connect to it (`next`, `parent`), and any values plugged into it (`inputs`, `fields`).
    *   **`variables`**: Information about variables specific to that target (or global).
    *   **`lists`**: Information about lists specific to that target (or global).
    *   **`costumes`**: A list of costumes for the target.
    *   **`sounds`**: A list of sounds for the target.
    *   Other properties like `name`, `x`, `y`, `visible`, etc.

Here's a tiny peek at what the structure looks like (simplified):

```json
{
  "meta": { "semver": "3.0.0" /* ... */ },
  "targets": [
    {
      "isStage": true, // This is the Stage
      "name": "Stage",
      "blocks": { /* ... blocks for the stage ... */ },
      "costumes": [ /* ... stage backdrops ... */ ],
      "sounds": [ /* ... stage sounds ... */ ]
      // ... other stage properties
    },
    {
      "isStage": false, // This is a Sprite
      "name": "Sprite1",
      "blocks": {
        "block_id_1": { // A unique ID for this block
          "opcode": "motion_movesteps", // Type of block (move 10 steps)
          "next": "block_id_2",       // ID of the block below it
          "parent": null,             // null if it's the start of a script
          "inputs": { /* ... values plugged in ... */ },
          "fields": { /* ... dropdown selections ... */ },
          "topLevel": true // true if it's a starting block (like 'when green flag clicked')
          // ... other block properties
        },
        "block_id_2": { /* ... another block ... */ }
      },
      "variables": { /* ... sprite's variables ... */ },
      "costumes": [ /* ... sprite's costumes ... */ ],
      "sounds": [ /* ... sprite's sounds ... */ ]
      // ... other sprite properties
    }
  ]
}
```

Don't worry about memorizing all the details! The key idea is that `ScratchInput` holds the *raw, original* structure from the Scratch file.

## How is `ScratchInput` Used?

In this `ast` project, we don't usually spend a lot of time working *directly* with the `ScratchInput` object. Its main job is to be the **first step**:

1.  A tool (outside this specific `ast` library, but using it) reads the `.sb3` file.
2.  It unzips it and parses the `project.json`.
3.  It creates an object that perfectly matches the `ScratchInput` type definition.
4.  This `ScratchInput` object is then passed into our conversion tools (which we'll learn about later) to be transformed into a more general format.

Think of it like receiving raw ingredients (the `ScratchInput`) before you start cooking (transforming it).

## Under the Hood: TypeScript Types

How do we ensure our code understands the `ScratchInput` structure correctly? We use TypeScript types!

The main type is defined simply:

```typescript
// File: types/input/scratch/index.ts
import { HttpsScratchMitEduSb3SchemaJson } from "./generated/sb3";

// Define ScratchInput as an alias for the detailed generated type
type ScratchInput = HttpsScratchMitEduSb3SchemaJson;

export default ScratchInput;
```

This code says that our `ScratchInput` type is just another name for `HttpsScratchMitEduSb3SchemaJson`.

Where does `HttpsScratchMitEduSb3SchemaJson` come from? It's a very detailed type definition that's *automatically generated* from Scratch's official "JSON Schema" (a formal description of the `project.json` structure). This ensures our types always match how Scratch saves files.

```typescript
// File: types/input/scratch/generated/sb3.ts (Simplified!)

// This interface defines the overall structure of project.json
export interface HttpsScratchMitEduSb3SchemaJson {
  meta: { // Project metadata
    semver: string; // Scratch version
    // ... other meta fields
  };
  targets: [] | [Stage & Target, ...(Sprite & Target)[]]; // List of targets
  // ... potentially other top-level fields
}

// Defines properties common to Stages and Sprites
export interface Target {
  blocks: { /* ... block definitions ... */ };
  variables: { /* ... variable definitions ... */ };
  lists?: { /* ... list definitions ... */ };
  costumes: [Costume, ...Costume[]]; // List of costumes
  sounds: Sound[]; // List of sounds
  // ... other common properties (name, volume, etc.)
}

// Defines properties specific to the Stage
export interface Stage {
  isStage: true;
  name: "Stage";
  // ... other stage properties (tempo, video state, etc.)
}

// Defines properties specific to Sprites
export interface Sprite {
  isStage: false;
  name: string;
  // ... other sprite properties (x, y, size, direction, etc.)
}

// ... interfaces for Block, Costume, Sound, etc. ...
```

Again, no need to grasp every detail here. The core idea is that we have precise TypeScript definitions that describe *exactly* what a `project.json` looks like.

We also have helper types to categorize the different kinds of Scratch blocks *as they appear in the `ScratchInput`*:

```typescript
// File: types/input/scratch/blocks/index.ts (Simplified!)

// Blocks that start scripts (e.g., 'when green flag clicked')
export type KnownBuiltinScratchHatBlock =
  | ControlHatBlock // e.g., 'when I start as a clone'
  | EventHatBlock   // e.g., 'when green flag clicked'
  // ... other categories ...

// Blocks that perform actions (e.g., 'move 10 steps')
export type KnownBuiltinScratchStatementBlock =
  | ControlStatementBlock // e.g., 'if', 'repeat'
  | MotionStatementBlock  // e.g., 'move', 'turn'
  | LooksStatementBlock   // e.g., 'say', 'switch costume'
  // ... other categories ...

// Blocks that report values (e.g., 'x position', 'touching mouse-pointer?')
export type KnownBuiltinScratchExpressionBlock =
  | DataExpressionBlock   // e.g., 'length of list'
  | MotionExpressionBlock // e.g., 'x position'
  | SensingExpressionBlock // e.g., 'touching?'
  | OperatorExpressionBlock // e.g., '+', 'and'
  // ... other categories ...
```

These categories help us understand the role of each block based on its Scratch definition, *before* we convert it later.

## Why Bother with `ScratchInput`?

Having this detailed, typed representation of the raw Scratch project is crucial because:

1.  **Accuracy:** It ensures we're reading the Scratch file correctly, based on its official structure.
2.  **Safety:** TypeScript helps prevent errors by making sure our code expects the right kind of data (e.g., expects `blocks` to be an object, not a list).
3.  **Foundation:** It provides a solid, well-defined starting point before we transform the data into other formats.

## Conclusion

In this chapter, we learned about **`ScratchInput`**. It's the detailed blueprint representing the raw data directly from a Scratch `.sb3` project file's `project.json`. It uses TypeScript types to precisely define the structure of targets (Stage and Sprites), blocks, variables, lists, costumes, and sounds, just as Scratch saves them.

While `ScratchInput` gives us the exact original structure, it's often very specific to Scratch. For many tasks, like analyzing code logic or converting it to another language, we need a more general, simplified representation.

That's where our next concept comes in! In the next chapter, we'll explore the [General Abstract Syntax Tree (GeneralAst)](02_general_abstract_syntax_tree__generalast__.md), which takes the `ScratchInput` and transforms it into a more universal format.

---

Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge)