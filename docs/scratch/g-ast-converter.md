# Scratch G-AST Converter

Each Scratch block is assigned to one of three categories:
- [Hat Blocks](https://en.scratch-wiki.info/wiki/Hat_Block) - starting blocks reacting to events.
- Statement Blocks - blocks that will be converted to G-AST statement nodes.
- Expression Blocks - blocks that will be converted to G-AST expression nodes.

The conversion process is handled by two main functions :
- `convertBlockTreeToStatement`
- `convertBlockTreeToExpression`

Both functions first branch based on th Scratch block category, such as:
- Motion
- Looks
- Sound
- Event
- Control
- Sensing
- Operator
- Variables (`data`)
- My Blocks (`procedures`)

Then each category is handled by a dedicated converter function. The function name follows the pattern: `convert<category>BlockTreeTo<type>`

For example: 

- `convertMotionBlockTreeToStatement` handles Motion blocks that produce statements.
- `convertSoundBlockTreeToExpression` handles Sound blocks that produce expressions.

Inside these category-specific functions, the **opcode** of each Scratch block is checked against a set of [known values](https://en.scratch-wiki.info/wiki/List_of_Block_Opcodes).

Based on this opcode, the block is then converted to either a statement or an expression.
