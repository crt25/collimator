type NonFunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type ClassProperties<T, TOmit extends string = ""> = Omit<
  Pick<T, NonFunctionPropertyNames<T>>,
  TOmit
>;
