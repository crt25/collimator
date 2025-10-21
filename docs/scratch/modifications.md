# Scratch Modifications

This document is intended for developers working on this project and who may need to update or maintain the Scratch integration.

This project modified Scratch, the scope of the changes and their purpose are described below.

## Edit and Solve mode

This project extends the Scratch GUI component to additionally accept a `canEditTask` property which, if disabled, deactivates the following built-in Scratch features:
- the button to load extensions is not shown
- the buttons to add new sprites is not shown
- the buttons to load stage sprites is not shown
- the buttons to delete, duplicate or export sprites is not shown
- the rendered stage is made non-interactive using `pointer-events: none`

In the following we will use "Task editing mode" (or "Edit mode") to denote `canEditTask=true` and "Task solve mode" (or "Solve mode") to denote `canEditTask=false`.

Moreover, the new properties `isCostumesTabEnabled` and `isSoundsTabEnabled` allow hiding the costume and sound tabs.

## CRT Config

To store additional information with a scratch project, we add an additional `crt.json` file into the zip archive.

## Block Config

To restrict the available blocks, we introduced the block config button rendered at the top left of each button in the [flyout toolbox](https://developers.google.com/blockly/guides/get-started/workspace-anatomy#flyout_toolbox) to the left.
The button shows either a number or the infinity symbol, indicting the number of times this block can be used by a student.

In the task editing mode, clicking this button opens a modal allowing the editor to configure whether the block can be used by students and if so, how many times.

Note that in editing mode, all blocks are shown in the flyout toolbox, even if they are completely disabled.
Otherwise it would be impossible for editors to re-enable blocks.
Moreover, the numbers do not change when blocks are added to the workspace.

In Solve mode, the label shown on the buttons is updated whenever a button is added to a target to keep track of the remaining blocks of that type.
Moreover, when the counter reaches zero, the block is completely disabled.

Blocks which the editor configures to be disallowed (a count of `0`), are never rendered in Solve mode.
However, blocks reaching a remaining count of zero are still shown.

### Implementation

Because the blocks part of the Scratch GUI is not rendered in React, we need to directly modify the DOM, which leads to unorthodox code in a React project.
Every time the toolbox is updated, we check its contents using CSS selectors and add the buttons whose text value is the number of remaining blocks.
The current number of used blocks is counted by iterating over the Scratch VM's targets (sprites, stage) and the number of allowed blocks is retrieved from the CRT config.

When pressing any block config button (e.g., to change the maximum number of allowed blocks), we dispatch on the Window object a `ModifyBlockConfigEvent` event containing the opcode of the block whose config we want to modify.
The `BlockConfig` React component listens for this event and, upon being triggered, renders a modal with a form to configure how often the block can be used.

When submitting the form, it directly updates th Scratch VM's config and then dispatches a `UpdateBlockToolboxEvent` event on the Window object. The (modified) Scratch component `Blocks` listens to this event.
Whenever it sees this event, it re-renders the toolbox resulting in updated numbers.

To reduce the number of available blocks of a given type, we add an event listener to listen for workspace changes in the modified `Blocks` component.
This event handler checks whether it is a block create or delete event and if it is, it triggers an update of the respective config button's label.

## Freezing Blocks

In order for teachers to provide some initial task blocks that cannot be edited by students, we extend scratch with a block freeze functionality.
There are three possible states: editable (default), appendable and frozen, each applying to an entire stack of blocks.

Whenever a block stack is created in the workspace, we show a small button at the top left, analogous to the block config buttons in the toolbox.
When clicking on the button in Edit mode, it iterates through the different states showing a different symbol for each.
At the same time, the CRT config is updated to store the new freeze state for the given stack (indexed by the id of the block at the top).

In Solve mode, initial blocks in an appendable or frozen stack are rendered in gray.
For appendable stacks, the respective symbol is shown at the top left of the stack.

The user cannot interact with any of these grayed out blocks.
In the case of frozen stacks, it is also impossible to prepend or append blocks.
In the case of appendable stacks, blocks can be appended at the end of the stack or in between if there are control blocks with a body.

### Implementation (⚠️ patching npm dependency `scratch-block`)

Because the workspace change updates we use for the block config are not in sync with the DOM elements, we instead rely on a DOM mutation observer for adding and removing the freeze buttons to the workspace stacks.

In addition, we also have a small code snippet in the workspace update listener that removes entries from the CRT config whenever a block is deleted.

When the blocks are frozen in Edit mode, we need to change the behavior of the npm module `scratch-blocks` to either prevent block prepends and appends ("frozen" state), or only block prepends ("appendable" state).
To avoid forking the entire project, we instead use a tiny patch file modifying the installed dependency.

In particular, we modify the `InsertionMarkerManager` responsible for the insertion markers (i.e. the grayed out area showing where a block will be placed).
Because of how Scratch is implemented, insertions are disabled entirely if we disable the insertion markers under some conditions.

We modify [this](https://github.com/scratchfoundation/scratch-blocks/blob/2e3a31e555a611f0c48d7c57074e2e54104c04ce/core/insertion_marker_manager.js#L476) check and add the following additional checks using a logical and:

- `(!(a.closest.sourceBlock_.svgGroup_.matches(".frozen-block-frozen"))`
to ensure that if stack is frozen, nothing can be added.
- `(!(a.closest.sourceBlock_.svgGroup_.matches(".frozen-block-appendable")) || (a.closest.type === 3 && a.closest.targetConnection === null))`
to ensure we can only append at the end if the stack is appendable.
By reverse-engineering we determined the type `3` to stand for appending and `targetConnection` being the existing connection where a block is inserted.
If there is no existing connection, i.e. the value is null, this means it is an insertion at the end (or within an empty control block slot).
