export type PartialNullable<T> = {
  [P in keyof T]?: T[P] | null;
};

export const omitNullValues = <T>(obj: PartialNullable<T>): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null),
  ) as Partial<T>;
