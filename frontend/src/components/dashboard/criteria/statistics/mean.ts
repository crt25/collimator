export const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length;
