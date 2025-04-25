import { useCallback, useEffect, useState } from "react";

type CustomStorageEventDetail = {
  storageKey: string;
  value: string;
};

const customStorageEventName = "localStorageEvent";

const createCustomStorageEvent = (
  storageKey: string,
  value: string,
): CustomEvent<CustomStorageEventDetail> =>
  new CustomEvent<CustomStorageEventDetail>(customStorageEventName, {
    detail: {
      storageKey,
      value,
    } satisfies CustomStorageEventDetail,
  });

const getInitialValue = <T extends object>(
  valueOrFunction: T | (() => T),
): T =>
  typeof valueOrFunction === "function" ? valueOrFunction() : valueOrFunction;

export const useLocalStorage = <T extends object>(
  storageKey: string,
  initialValue: T | (() => T),
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof localStorage === "undefined") {
      // for SSR we return the default value
      return getInitialValue(initialValue);
    }

    const item = localStorage.getItem(storageKey);

    return item ? JSON.parse(item) : getInitialValue(initialValue);
  });

  const updateValue = useCallback(
    (value: T) => {
      setStoredValue(value);

      const stringValue = JSON.stringify(value);
      window.dispatchEvent(createCustomStorageEvent(storageKey, stringValue));
      localStorage.setItem(storageKey, stringValue);
    },
    [storageKey],
  );

  useEffect(() => {
    // listen to window storage events to update the state when the localStorage changes
    const handleStorageChange = (
      key: string | null,
      newValue: string | null,
    ): void => {
      if (key !== storageKey || newValue === null) {
        return;
      }

      setStoredValue(JSON.parse(newValue));
    };

    const handleOtherWindowStorageChange = (event: StorageEvent): void =>
      handleStorageChange(event.key, event.newValue);

    const handleOwnWindowStorageChange = (event: Event): void => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const { storageKey, value } = event.detail as CustomStorageEventDetail;
      handleStorageChange(storageKey, value);
    };

    window.addEventListener("storage", handleOtherWindowStorageChange);
    window.addEventListener(
      customStorageEventName,
      handleOwnWindowStorageChange,
    );

    return (): void => {
      window.removeEventListener("storage", handleOtherWindowStorageChange);
      window.removeEventListener(
        customStorageEventName,
        handleOwnWindowStorageChange,
      );
    };
  }, [storageKey]);

  return [storedValue, updateValue];
};
