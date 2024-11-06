export const svgNamespace = "http://www.w3.org/2000/svg";

export const ignoreEvent = (event: MouseEvent): void => {
  event.stopImmediatePropagation();
  event.preventDefault();
};
