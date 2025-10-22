export const hasSoftDelete = (
  model: string | undefined,
  models: string[],
): boolean => {
  return model != null && models.includes(model);
};
