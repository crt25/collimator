import VM from "scratch-vm";

const svgNamespace = "http://www.w3.org/2000/svg";
const buttonHeight = 20;
const buttonWidth = 60;

const ignoreEvent = (event: MouseEvent): void => {
  event.stopImmediatePropagation();
  event.preventDefault();
};

const getBlockId = (dataId: string): string => {
  // some blocks prefix the block type with the target id followed by a colon
  // e.g. "someId:motion_xposition"
  // if so, remove this prefix

  const colonIndex = dataId.indexOf("__");
  if (colonIndex !== -1) {
    return dataId.slice(colonIndex + 2);
  }

  return dataId;
};

export const addHideBlockButtons = (
  vm: VM,
  container: HTMLElement,
  requestToolboxUpdate: () => void,
): void => {
  if (!vm.crtConfig) {
    return;
  }

  const config = vm.crtConfig;

  const onHide = (event: MouseEvent): void => {
    ignoreEvent(event);
    if (event.currentTarget instanceof Element) {
      const parent = event.currentTarget.parentElement;
      const dataId = parent?.getAttribute("data-id");

      if (dataId) {
        config.allowedBlocks[getBlockId(dataId)] = false;
      }
    }

    requestToolboxUpdate();
  };

  const onShow = (event: MouseEvent): void => {
    ignoreEvent(event);
    if (event.currentTarget instanceof Element) {
      const parent = event.currentTarget.parentElement;
      const dataId = parent?.getAttribute("data-id");

      if (dataId) {
        config.allowedBlocks[getBlockId(dataId)] = true;
      }
    }

    requestToolboxUpdate();
  };

  const canvas = container.querySelector(
    "svg.blocklyFlyout .blocklyBlockCanvas",
  );
  if (!canvas) {
    return;
  }

  // get scale factor
  const scale = /scale\((\d+\.?\d*)\)/.exec(
    canvas.getAttribute("transform") || "",
  );
  if (!scale) {
    return;
  }

  const blocks = canvas.querySelectorAll(".blocklyDraggable[data-id]");
  blocks.forEach((block) => {
    const blockId = getBlockId(block.getAttribute("data-id") as string);
    const isShown = config.allowedBlocks[blockId];

    const group = document.createElementNS(svgNamespace, "g");

    group.setAttribute(
      "class",
      isShown ? "shown-block-button" : "hidden-block-button",
    );
    group.setAttribute("transform", `translate(0, -10)`);
    group.addEventListener("click", isShown ? onHide : onShow);
    group.addEventListener("mousedown", ignoreEvent);
    group.addEventListener("mouseup", ignoreEvent);

    // create svg rect element with text inside
    const rect = document.createElementNS(svgNamespace, "rect");
    rect.setAttribute("width", buttonWidth.toString());
    rect.setAttribute("height", buttonHeight.toString());
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("rx", "5");
    rect.setAttribute("ry", "5");

    const text = document.createElementNS(svgNamespace, "text");
    text.setAttribute("x", "5");
    text.setAttribute("y", "15");
    text.textContent = isShown ? "Shown" : "Hidden";

    group.appendChild(rect);
    group.appendChild(text);
    block.appendChild(group);
  });
};
