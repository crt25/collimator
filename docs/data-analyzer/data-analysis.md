# Data analysis

After AST conversion, ClassMosaic can handle task results and perform analysis.

ClassMosaic implements two algorithms to compute distances between trees:

- **[pqGrams](https://github.com/hoonto/jqgram)** provides a very fast approximation of tree edit distance.
- **[Zhang-Shasha](https://github.com/schulzch/edit-distance-js)** computes the exact tree edit distance by decomposing trees into substructures (like puzzle pieces) and comparing them.
