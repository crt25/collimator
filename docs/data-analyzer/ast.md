# Generalized Abstract Syntax Tree (G-AST)

## Terminology

We use standard graph theory terminology when referring to the G-AST with the caveat that we use *(tree) node* instead of *vertex* to make it explicit we are talking about a tree and not a general graph.
A **child** $c$ of a node $p$ is a node with a directed edge from parent $p$ to child $c$: $p \to c$.


At the top level, a generalized G-AST consists of a list of *actor* nodes.
An actor may be a scratch target (the stage, a cat, etc.), a C program or even a service such as an HTTP service.

On the next level, each actor has an arbitrary set of *event listener* children.
Each of those event listeners consists of a *condition* and an *action* child.
Such an event listener may represent a scratch hat block, a C program's main function or an endpoint of an API.

The condition of an event listener is described by a string and a list of *expression* children.
The action of an event listener is described by a *statement* sequence.

Expressions  are different from statements in the aspect of having a value.
For instance a literal is an expression whereas a control structure such as a condition or a variable assignment/declaration is a statement.
