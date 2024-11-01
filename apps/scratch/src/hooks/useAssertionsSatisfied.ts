import { useEffect, useState } from "react";
import VM from "scratch-vm";

export const useAssertionsSatisfied = (vm: VM): boolean => {
  const [assertionsSatisfied, setAssertionsSatisfied] = useState(false);

  useEffect(() => {
    vm.runtime.on("ASSERTIONS_CHECKED", setAssertionsSatisfied);

    return (): void => {
      vm.runtime.off("ASSERTIONS_CHECKED", setAssertionsSatisfied);
    };
  }, [vm, setAssertionsSatisfied]);

  return assertionsSatisfied;
};
