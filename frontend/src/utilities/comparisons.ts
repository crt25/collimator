export const compareLabels = <T extends { label: string }>(
  a: T,
  b: T,
): number => a.label.localeCompare(b.label);
