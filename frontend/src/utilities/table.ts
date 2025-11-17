export const isClickOnRow = (e: React.MouseEvent<HTMLElement>): boolean => {
  if (e.target instanceof Element && e.target.closest("button") === null) {
    return true;
  }
  return false;
};
