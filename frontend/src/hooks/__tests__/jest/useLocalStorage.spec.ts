import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("behaves like React's useState", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", { count: 0 }),
    );

    const [storedValue, setStoredValue] = result.current;

    expect(storedValue).toEqual({ count: 0 });

    act(() => {
      setStoredValue({ count: 1 });
    });

    const [updatedValue] = result.current;
    expect(updatedValue).toEqual({ count: 1 });
    expect(JSON.parse(localStorage.getItem("testKey")!)).toEqual({ count: 1 });
  });

  it("updates the stored value when a storage event is dispatched", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", { count: 0 }),
    );

    const [storedValue] = result.current;
    expect(storedValue).toEqual({ count: 0 });

    act(() => {
      const event = new StorageEvent("storage", {
        key: "testKey",
        newValue: JSON.stringify({ count: 2 }),
      });
      window.dispatchEvent(event);
    });

    const [updatedValue] = result.current;
    expect(updatedValue).toEqual({ count: 2 });
  });

  it("updates all instances with the same storage key when one changes", () => {
    const { result: hook1 } = renderHook(() =>
      useLocalStorage("sharedKey", { count: 0 }),
    );
    const { result: hook2 } = renderHook(() =>
      useLocalStorage("sharedKey", { count: 0 }),
    );

    const [storedValue1, setStoredValue1] = hook1.current;
    const [storedValue2] = hook2.current;

    expect(storedValue1).toEqual({ count: 0 });
    expect(storedValue2).toEqual({ count: 0 });

    act(() => {
      setStoredValue1({ count: 3 });
    });

    const [updatedValue1] = hook1.current;
    const [updatedValue2] = hook2.current;

    expect(updatedValue1).toEqual({ count: 3 });
    expect(updatedValue2).toEqual({ count: 3 });
  });
});
