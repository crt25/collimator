export const getValueFromSessionStorageAndDelete = <DefaultValueType>(
  key: string,
  defaultValue: DefaultValueType,
): string | DefaultValueType => {
  const value = sessionStorage.getItem(key);

  if (!value) {
    return defaultValue;
  }

  sessionStorage.removeItem(key);

  return value;
};

export const getAssertedValueFromSessionStorageAndDelete = (
  key: string,
): string => {
  const value = getValueFromSessionStorageAndDelete(key, undefined);

  if (!value) {
    throw new Error(`Value for key ${key} not found in session storage`);
  }

  return value;
};
