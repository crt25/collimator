# Chapter 3: General AST Nodes (`AstNode`)

Welcome back! In [Chapter 2: General Abstract Syntax Tree (GeneralAst)](02_general_abstract_syntax_tree__generalast__.md), we learned about the `GeneralAst` - our universal blueprint for understanding program logic, independent of Scratch's specific details. We saw it's made of actors, event listeners, statements, and expressions.

Now, let's zoom in on those building blocks. How do we represent a single action like "move 10 steps" or a value like the number `10` within the `GeneralAst`? We need a standard set of pieces, like LEGO bricks, to construct our blueprint. These standard pieces are what we call **General AST Nodes** (often referred to generically as `AstNode`).

## Motivation: Understanding a Simple Script

Imagine you have a simple Scratch script:

*   When the Green Flag is clicked:
    *   Move 10 steps

We know from Chapter 2 that this script will be part of the `GeneralAst`. But how do we represent the *specifics*?

*   What represents the "Green Flag" trigger?
*   What represents the "Move 10 steps" action?
*   What represents the number "10"?
*   What holds this script together as belonging to a particular Sprite?

To answer these questions, we need defined node types within our `GeneralAst`.

## The Building Blocks: Key `AstNode` Types

Think of the `GeneralAst` as the final assembled LEGO model. The different `AstNode` types are the individual bricks you used to build it. Each brick has a specific shape and purpose. The main types are:

1.  **`ActorNode`**: The Baseplate
    *   **What it is:** Represents a character (Sprite) or the Stage. It's the container for all the scripts and functions belonging to that specific actor.
    *   **Analogy:** Like the big, flat LEGO baseplate. It doesn't *do* much on its own, but it holds all the other pieces (scripts) together in one place.
    *   We saw this in Chapter 2 – it holds `EventListenerNode`s and `FunctionDeclarationNode`s.

2.  **`EventListenerNode`**: The Script Trigger
    *   **What it is:** Represents a whole script that starts with an event hat block (like "when green flag clicked", "when this sprite clicked", "when I receive message").
    *   **Analogy:** A special LEGO piece with a button or sensor. When the event happens (button pressed), it triggers the sequence of bricks attached to it.
    *   It contains two main parts:
        *   `condition`: Describes *what* event triggers it (e.g., `"green-flag"`).
        *   `action`: A sequence of `StatementNode`s representing the blocks snapped below the hat block.

3.  **`StatementNode`**: The Action Bricks
    *   **What it is:** Represents a single command or action that *does* something but doesn't produce a value on its own. This includes things like moving, saying something, changing a variable, waiting, looping (`repeat`), or making decisions (`if/else`).
    *   **Analogy:** The standard rectangular LEGO bricks. They build the structure and perform the main actions of your model.
    *   There are several kinds of `StatementNode`s, such as:
        *   `FunctionCallNode`: Represents calling a built-in command (like `move`) or a custom block.
        *   `VariableAssignmentNode`: Represents changing the value of a variable (`set score to 0`).
        *   `LoopNode`: Represents repeating actions (`repeat 10`).
        *   `ConditionNode`: Represents `if` or `if/else` blocks.
        *   `StatementSequenceNode`: Simply a list of other statements executed one after another.

4.  **`ExpressionNode`**: The Value Bricks/Studs
    *   **What it is:** Represents anything that has a *value*. This could be a fixed number (like `10`), text (like `"Hello!"`), the value of a variable (like `score`), or the result of a calculation (like `x position + 5`). Expressions are often plugged *into* the slots of `StatementNode`s.
    *   **Analogy:** The small, round LEGO studs, number pieces, or slanted pieces. They don't form the main structure, but they provide the details, values, or connections needed by the action bricks.
    *   There are several kinds of `ExpressionNode`s, such as:
        *   `LiteralNode`: Represents a fixed value (e.g., `10`, `"Hello!"`, `true`).
        *   `VariableNode`: Represents reading the value of a variable (e.g., using the `score` variable in a calculation).
        *   `OperatorNode`: Represents a calculation using operators (e.g., `+`, `-`, `*`, `/`, `and`, `or`, `>`).
        *   `FunctionCallExpressionNode`: Represents calling a block that *reports* a value (like `timer` or `answer`).

These four main types (`ActorNode`, `EventListenerNode`, `StatementNode`, `ExpressionNode`) are the fundamental pieces used to build the entire `GeneralAst`.

## Use Case Solved: Representing "Move 10 Steps"

Let's revisit our simple script: "When Green Flag clicked, Move 10 steps". How would this look using our `AstNode` building blocks (simplified)?

```mermaid
graph TD
    Actor(ActorNode: Sprite1) --> EventListener(EventListenerNode)
    EventListener -- condition --> EventCond(Event: "green-flag")
    EventListener -- action --> Seq(StatementSequenceNode)
    Seq --> Stmt(StatementNode: FunctionCallNode)
    Stmt -- function name --> FuncName("move")
    Stmt -- argument 1 --> Expr(ExpressionNode: LiteralNode)
    Expr -- value --> Val(10)
```

*   We start with an `ActorNode` representing our Sprite.
*   Inside its `eventListeners` list, there's an `EventListenerNode`.
    *   Its `condition` specifies the event `"green-flag"`.
    *   Its `action` is a `StatementSequenceNode` (a list containing just one action here).
*   Inside the sequence, there's a `StatementNode`. Specifically, it's a `FunctionCallNode` because "move steps" is a command/function.
    *   The function being called is identified perhaps by the name `"move"`.
    *   This function needs an input (how many steps). This input is represented by an `ExpressionNode`. Specifically, it's a `LiteralNode` because `10` is a fixed value.
        *   The `LiteralNode` holds the actual value `10`.

By combining these specific `AstNode` types, we can accurately represent the structure and meaning of the original Scratch script in our universal `GeneralAst` format.

## Under the Hood: TypeScript Types

How does our code know about these different node types? They are defined using TypeScript `interface`s, mostly found in the `types/general-ast/ast-nodes/` directory.

Every node type shares a base structure:

```typescript
// File: types/general-ast/ast-node-base.ts
import { AstNodeType } from "./ast-node-type";

// ALL GeneralAst nodes share these basic properties
export interface AstNodeBase {
  nodeType: AstNodeType; // What kind of node is this?
  componentId?: string; // Optional: For advanced use
}
```
*   This ensures every node tells us its `nodeType` (actor, eventListener, statement, or expression).

Let's look at a simplified `StatementNode` type for calling a function (like `move`):

```typescript
// File: types/general-ast/ast-nodes/statement-node/function-call-node.ts (Simplified)
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";
import { ExpressionNode } from "../expression-node"; // Inputs are expressions!

// Represents calling a function/command like 'move 10'
export interface FunctionCallNode extends StatementNodeBase {
  nodeType: StatementNodeType.functionCall; // It's a function call statement
  functionName: string; // Name of the function, e.g., "move"
  arguments: ExpressionNode[]; // List of inputs/arguments
}
```
*   This defines a `FunctionCallNode` as a type of statement. It has a `functionName` (like `"move"`) and a list of `arguments` (which must be `ExpressionNode`s, like the `LiteralNode(10)`).

And an `ExpressionNode` type for a literal value (like `10`):

```typescript
// File: types/general-ast/ast-nodes/expression-node/literal-node.ts (Simplified)
import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";

// Represents a fixed value like 10, "hello", true
export interface LiteralNode extends ExpressionNodeBase {
  nodeType: ExpressionNodeType.literal; // It's a literal expression
  value: string | number | boolean; // The actual value it holds
}
```
*   This defines a `LiteralNode` as a type of expression that simply holds a raw `value`.

There are many other specific types defined for different kinds of statements (loops, conditions, assignments) and expressions (variables, operators), all inheriting from the base `StatementNode` or `ExpressionNode` types.

```typescript
// File: types/general-ast/ast-nodes/statement-node/index.ts (Excerpt)

// A StatementNode can be one of many specific kinds
export type StatementNode =
  | ConditionNode // if/else
  | FunctionDeclarationNode // Custom block definition
  | LoopNode // repeat / forever
  | VariableAssignmentNode // set variable to ...
  | VariableDeclarationNode // (Less common in Scratch)
  | FunctionCallNode // move / say / call custom block
  | StatementSequenceNode; // A list of statements
```

```typescript
// File: types/general-ast/ast-nodes/expression-node/index.ts (Excerpt)

// An ExpressionNode represents a value
export type ExpressionNode =
  | LiteralNode // 10, "hello", true
  | FunctionCallExpressionNode // timer, answer
  | VariableNode // score, x position (when read)
  | OperatorNode; // +, -, and, or, >
```

You don't need to memorize all these specific types right now. The key idea is that we have a well-defined set of node types (our LEGO bricks) that allow us to represent any program's logic within the `GeneralAst`.

## Conclusion

In this chapter, we dove into the building blocks of the `GeneralAst`: the **General AST Nodes (`AstNode`)**. We learned about the main categories:

*   **`ActorNode`**: The container (Sprite/Stage).
*   **`EventListenerNode`**: The script trigger (event hat block + script).
*   **`StatementNode`**: The actions/commands (move, set variable, loop, if).
*   **`ExpressionNode`**: The values (numbers, text, variables, calculations).

These nodes, defined with specific TypeScript types, act like a standard set of LEGO bricks. By combining them, we can construct a `GeneralAst` that represents the essential logic of a program (like a Scratch project) in a universal way.

We now understand what the `ScratchInput` (Chapter 1) looks like and what the target `GeneralAst` (Chapter 2) and its `AstNode` components (Chapter 3) are. But how do we actually get from the Scratch-specific format to the general format?

In the next chapter, we'll explore the tools responsible for this transformation: the [AST Conversion Service & Worker](04_ast_conversion_service___worker__.md).

---

Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge)