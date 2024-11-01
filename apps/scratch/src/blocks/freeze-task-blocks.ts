import VM from "scratch-vm";
import { ignoreEvent } from "./helpers";
import { BlockFreezeStates } from "./types";

const svgNamespace = "http://www.w3.org/2000/svg";
const buttonHeight = 20;
const buttonWidth = 30;

const stateDisplayName: Record<BlockFreezeStates, string> = {
  [BlockFreezeStates.frozen]: "🛇",
  [BlockFreezeStates.appendable]: "+",
  [BlockFreezeStates.editable]: "✎",
};

const defaultState = BlockFreezeStates.editable;

const allStates = Object.values(BlockFreezeStates);

const getNextState = (currentState?: BlockFreezeStates): BlockFreezeStates =>
  allStates[
    (allStates.indexOf(currentState ?? defaultState) + 1) % allStates.length
  ];

const updateStackFreezeButton = (
  stack: SVGGElement,
  state: BlockFreezeStates | undefined,
  canEditTask?: boolean,
): void => {
  const group = stack.querySelector<SVGGElement>("g.stack-freeze-button");
  const s = state ?? defaultState;

  const showButton =
    canEditTask ||
    // for students, only show the state if it is appendable
    s === BlockFreezeStates.appendable;

  if (!group) {
    return;
  }

  group.setAttribute(
    "class",
    showButton ? "stack-freeze-button" : "stack-freeze-button d-none",
  );

  const text = group.querySelector<SVGTextElement>("text");
  if (text) {
    text.textContent = stateDisplayName[s];
  }
};

export const addFreezeButtonsToStack = (
  vm: VM,
  stack: SVGGElement,
  canEditTask?: boolean,
): void => {
  // ensure the buttons are not already present
  if (stack.querySelector("g.stack-freeze-button")) {
    return;
  }

  const blockId = stack.getAttribute("data-id");

  if (!blockId) {
    return;
  }

  const onFreezeStackClick = (event: MouseEvent): void => {
    ignoreEvent(event);

    if (event.currentTarget instanceof Element) {
      const config = vm.crtConfig;

      if (config) {
        config.taskBlockIds[blockId] = getNextState(
          config.taskBlockIds[blockId],
        );

        updateStackFreezeButton(
          stack,
          config.taskBlockIds[blockId],
          canEditTask,
        );
      }
    }
  };

  const group = document.createElementNS(svgNamespace, "g");

  group.setAttribute("class", "stack-freeze-button");
  group.setAttribute("data-testid", "stack-freeze-button");
  group.setAttribute("transform", `translate(0, -10)`);
  group.addEventListener(
    "click",
    canEditTask ? onFreezeStackClick : ignoreEvent,
  );
  group.addEventListener("mousedown", ignoreEvent);
  group.addEventListener("mouseup", ignoreEvent);

  // create svg rect element with text inside
  const rect = document.createElementNS(svgNamespace, "rect");
  rect.setAttribute("class", "interactive");
  rect.setAttribute("width", buttonWidth.toString());
  rect.setAttribute("height", buttonHeight.toString());
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("rx", "5");
  rect.setAttribute("ry", "5");

  const text = document.createElementNS(svgNamespace, "text");
  text.setAttribute("x", "5");
  text.setAttribute("y", "15");
  text.textContent = ``;

  group.appendChild(rect);
  group.appendChild(text);
  stack.appendChild(group);

  updateStackFreezeButton(
    stack,
    vm.crtConfig?.taskBlockIds[blockId],
    canEditTask,
  );
};

export const removeFreezeButtons = (vm: VM, stack: SVGGElement): void => {
  const blockId = stack.getAttribute("data-id");
  const config = vm.crtConfig;
  if (!blockId || !config) {
    return;
  }

  delete config.taskBlockIds[blockId];
  stack.querySelector("g.stack-freeze-button")?.remove();
};

export const freezeTaskBlocks = (vm: VM, container: HTMLElement): void => {
  // by default a stack is editable
  const stateByBlockId = vm.crtConfig?.taskBlockIds ?? {};

  for (const [taskBlockId, freezeState] of Object.entries(
    stateByBlockId,
  ).filter(([_, state]) => state !== BlockFreezeStates.editable)) {
    const stack = container.querySelector<SVGGElement>(
      `svg.blocklySvg .blocklyBlockCanvas g.blocklyDraggable[data-id='${taskBlockId}']:not(g.blocklyDraggable g)`,
    );

    // add the frozen class to all blocks in the stack
    stack?.classList.add(`frozen-block-${freezeState}`);
    stack
      ?.querySelectorAll("g.blocklyDraggable")
      .forEach((block) => block.classList.add(`frozen-block-${freezeState}`));
  }
};
