const prefixOrder = ["𝓡", "⭐"];

export const compareLabels = <T extends { label: string }>(
  a: T,
  b: T,
): number => {
  const aPrefix = a.label.split(" ")[0];
  const bPrefix = b.label.split(" ")[0];

  const aIndex = prefixOrder.indexOf(aPrefix);
  const bIndex = prefixOrder.indexOf(bPrefix);

  if (aIndex === -1 && bIndex === -1) {
    return a.label.localeCompare(b.label);
  } else if (aIndex === -1) {
    return 1;
  } else if (bIndex === -1) {
    return -1;
  }

  return aIndex - bIndex;
};
