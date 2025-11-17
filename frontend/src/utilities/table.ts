export const isClickOnRow = (e: React.MouseEvent<HTMLElement>): boolean => {
  if (
    e.target instanceof Element &&
    (e.target.tagName === "TD" || e.target.tagName === "SPAN")
  ) {
    return true;
  }
  return false;
};
