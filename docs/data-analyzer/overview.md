# How ClassMosaic analyze task results?

When a teacher prepares a task in a lesson, students complete the task and submit their results.

How can the teacher compare the different student results with one another or with her own solution?

In the `backend`, ClassMosaic converts each result in a [Generalized Abstract Syntax Tree (G-AST)](./ast.md). This structure makes it possible to calculate similarities and differences between solutions.

The `/frontend` then performs the analysis and displays the results to the teacher.

By comparing student outputs with the set of expected solutions provided by the teacher, ClassMosaic can group similar results together.

For example, two students may solve a Scratch task in different ways. Even if the code looks different, ClassMosaic recognizes that the underlying Generalized Abstract Syntax Tree (G-AST) is equivalent, and groups their results together.

## Algorithms used in data-analyzer

ClassMosaic implements two algorithms to compute a distance between trees :

- **[pqGrams](https://github.com/hoonto/jqgram)** provides an extremely fast approximate tree edit distance.
- **[Zangh-Shasha](https://github.com/schulzch/edit-distance-js)** takes multiple parts of a tree, like puzzle pieces and compares it with a set of parts coming for another tree.

