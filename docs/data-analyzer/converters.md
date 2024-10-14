# G-AST Converters

## Scratch G-AST Converter

Each scratch block is assigned to one of three categories:
- [Hat Blocks](https://en.scratch-wiki.info/wiki/Hat_Block) - starting blocks reacting to events.
- Statement Blocks - blocks that will be converted to G-AST statement nodes.
- Expression Blocks - blocks that will be converted to G-AST expression nodes.

The functions `convertBlockTreeToStatement` and `convertBlockTreeToExpression` first branches depending on the scratch block categories
- Motion
- Looks
- Sound
- Events
- Control
- Sensing
- Operators
- Variables (`data`)
- My Blocks (`procedures`)

and then calls a function named after the category and the respective node type e.g. `convertMotionBlockTreeToStatement` or `convertSoundBlockTreeToExpression`.

Within that function, the opcode of the respective block is checked against a set of [known values](https://en.scratch-wiki.info/wiki/List_of_Block_Opcodes) and is then converted to either a statement or an expression.