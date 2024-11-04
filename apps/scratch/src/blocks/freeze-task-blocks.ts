import VM from "scratch-vm";
import { ignoreEvent, svgNamespace } from "./helpers";
import { BlockFreezeStates } from "./types";
import {
  isScratchBlock,
  isVisualTopOfStackWithId,
} from "../utilities/scratch-selectors";

const buttonHeight = 20;
const buttonWidth = 30;
const freezeBlockButtonClass = "stack-freeze-button";
const freezeBlockButtonTestId = "stack-freeze-button";
const isFreezeBlockButton = `g.${freezeBlockButtonClass}`;

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
  const group = stack.querySelector<SVGGElement>(isFreezeBlockButton);
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
    showButton ? freezeBlockButtonClass : `${freezeBlockButtonClass} d-none`,
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
  if (stack.querySelector(isFreezeBlockButton)) {
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
        config.freezeStateByBlockId[blockId] = getNextState(
          config.freezeStateByBlockId[blockId],
        );

        updateStackFreezeButton(
          stack,
          config.freezeStateByBlockId[blockId],
          canEditTask,
        );
      }
    }
  };

  const group = document.createElementNS(svgNamespace, "g");

  group.setAttribute("class", freezeBlockButtonClass);
  group.setAttribute("data-testid", freezeBlockButtonTestId);
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
    vm.crtConfig?.freezeStateByBlockId[blockId],
    canEditTask,
  );
};

export const removeFreezeButtons = (vm: VM, stack: SVGGElement): void => {
  const blockId = stack.getAttribute("data-id");
  const config = vm.crtConfig;
  if (!blockId || !config) {
    return;
  }

  delete config.freezeStateByBlockId[blockId];
  stack.querySelector(isFreezeBlockButton)?.remove();
};

export const freezeTaskBlocks = (vm: VM, container: HTMLElement): void => {
  const stateByBlockId = Object.entries(
    // by default a stack is editable, i.e. does not have an entry
    vm.crtConfig?.freezeStateByBlockId ?? {},
  ).filter(([_, state]) => state !== BlockFreezeStates.editable);

  for (const [taskBlockId, freezeState] of stateByBlockId) {
    const stack = container.querySelector<SVGGElement>(
      isVisualTopOfStackWithId(taskBlockId),
    );

    // add the frozen class to all blocks in the stack
    stack?.classList.add(`frozen-block-${freezeState}`);
    stack
      ?.querySelectorAll(isScratchBlock)
      .forEach((block) => block.classList.add(`frozen-block-${freezeState}`));
  }
};
