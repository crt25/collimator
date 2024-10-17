import VM from "scratch-vm";

const svgNamespace = "http://www.w3.org/2000/svg";
const buttonHeight = 20;
const buttonWidth = 60;

const ignoreEvent = (event: MouseEvent): void => {
  event.stopImmediatePropagation();
  event.preventDefault();
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
      const blockId = parent?.getAttribute("data-id");

      if (blockId) {
        config.allowedBlocks[blockId] = false;
      }
    }

    requestToolboxUpdate();
  };

  const onShow = (event: MouseEvent): void => {
    ignoreEvent(event);
    if (event.currentTarget instanceof Element) {
      const parent = event.currentTarget.parentElement;
      const blockId = parent?.getAttribute("data-id");

      if (blockId) {
        config.allowedBlocks[blockId] = true;
      }
    }

    requestToolboxUpdate();
  };

  const canvas = container.querySelector(".blocklyBlockCanvas");
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

  const blocks = container.querySelectorAll(".blocklyDraggable[data-id]");
  blocks.forEach((block) => {
    const blockId = block.getAttribute("data-id") as string;
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
