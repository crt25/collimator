import { useEffect, useState } from "react";
import VM from "scratch-vm";

export const useAssertionsState = (
  vm: VM,
): { total: number; passed: number } => {
  const [assertionsSatisfied, setAssertionsSatisfied] = useState({
    total: 0,
    passed: 0,
  });

  useEffect(() => {
    const fn = (total: number, passed: number): void =>
      setAssertionsSatisfied({ total, passed });

    vm.runtime.on("ASSERTIONS_CHECKED", fn);

    return (): void => {
      vm.runtime.off("ASSERTIONS_CHECKED", fn);
    };
  }, [vm, setAssertionsSatisfied]);

  return assertionsSatisfied;
};
