export const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
