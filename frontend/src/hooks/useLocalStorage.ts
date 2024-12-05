import { useCallback, useState } from "react";

export const useLocalStorage = <T>(
  storageKey: string,
  initialValue: T,
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof sessionStorage === "undefined") {
      // for SSR we return the default value
      return initialValue;
    }

    const item = localStorage.getItem(storageKey);

    return item ? JSON.parse(item) : initialValue;
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
