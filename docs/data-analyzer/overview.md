# How ClassMosaic analyze task results?

When a teacher prepares a task in a lesson, students complete the task and submit their results.

How can the teacher compare the different student results with one another or with her own solution?

In the `backend`, ClassMosaic converts each result in a Generalized Abstract Syntax Tree (G-AST). This structure makes it possible to calculate similarities and differences between solutions.

The `/frontend` then performs the analysis and displays the results to the teacher.

## Introduction of G-AST translation

The translation is deterministic: the same code is always translated to the same G-AST.

In addition, **the translation process normalizes certain syntactic constructs**. For example:

- Any kind of loop is represented as a single `loop` node type, with the condition determined by the specific loop construct being translated.
- Operators are unified under a generalized `operator` node type, which can represent any operator (`+`, `-`, `|`, `||`, etc.) with an arbitrary number of operands.

Each programming language has its own converter, combining both a shared grammar and language-specific rules.

Learn more about [Generalized Abstract Syntax Tree (G-AST)](./ast.md) and the [converters](./converters.md).


## Algorithms used in the Data Analyzer

ClassMosaic implements two algorithms to compute a distances between trees:

- **[pqGrams](https://github.com/hoonto/jqgram)** provides an very fast approximation of tree edit distance.
- **[Zangh-Shasha](https://github.com/schulzch/edit-distance-js)** computes the exact tree edit distance by decomposing trees into substructures (like puzzle pieces) and comparing them.

