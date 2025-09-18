# How ClassMosaic analyze task results?

When a teacher prepares a task in a lesson, students complete the task and submit their results.

How can the teacher compare the different student results with one another or with her own solution?

In the `backend`, ClassMosaic converts each result in a [Generalized Abstract Syntax Tree (G-AST)](./ast.md). This structure makes it possible to calculate similarities and differences between solutions.

The `/frontend` then performs the analysis and displays the results to the teacher.

By comparing student outputs with the set of expected solutions provided by the teacher, ClassMosaic can group similar results together.

For example, two students may solve a Scratch task in different ways. Even if the code looks different, ClassMosaic recognizes that the underlying Generalized Abstract Syntax Tree (G-AST) is equivalent, and groups their results together.

## Algorithms used in the Data Analyzer

ClassMosaic implements two algorithms to compute a distances between trees:

- **[pqGrams](https://github.com/hoonto/jqgram)** provides an very fast approximation of tree edit distance.
- **[Zangh-Shasha](https://github.com/schulzch/edit-distance-js)** computes the exact tree edit distance by decomposing trees into substructures (like puzzle pieces) and comparing them.

