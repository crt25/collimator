export const tryGetAndDelete = <DefaultValueType>(
  key: string,
  defaultValue: DefaultValueType,
): string | DefaultValueType => {
  const value = localStorage.getItem(key);

  if (!value) {
    return defaultValue;
  }

  localStorage.removeItem(key);

  return value;
};

export const getAndDelete = (key: string): string => {
  const value = tryGetAndDelete(key, undefined);

  if (!value) {
    throw new Error(`Value for key ${key} not found in local storage`);
  }

  return value;
};

export const setItem = (key: string, value: string): void =>
  localStorage.setItem(key, value);
