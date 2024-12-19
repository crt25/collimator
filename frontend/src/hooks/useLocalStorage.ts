import { useCallback, useState } from "react";

const getInitialValue = <T extends object>(
  valueOrFunction: T | (() => T),
): T =>
  typeof valueOrFunction === "function" ? valueOrFunction() : valueOrFunction;

export const useLocalStorage = <T extends object>(
  storageKey: string,
  initialValue: T | (() => T),
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof sessionStorage === "undefined") {
      // for SSR we return the default value
      return getInitialValue(initialValue);
    }

    const item = localStorage.getItem(storageKey);

    return item ? JSON.parse(item) : getInitialValue(initialValue);
  });

  const updateValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      localStorage.setItem(storageKey, JSON.stringify(value));
    },
    [storageKey],
  );

  return [storedValue, updateValue];
};
