# Data analysis

After AST conversion, ClassMosaic can handle task results and make some analysis.

ClassMosaic implements two algorithms to compute a distances between trees:

- **[pqGrams](https://github.com/hoonto/jqgram)** provides an very fast approximation of tree edit distance.
- **[Zangh-Shasha](https://github.com/schulzch/edit-distance-js)** computes the exact tree edit distance by decomposing trees into substructures (like puzzle pieces) and comparing them.
