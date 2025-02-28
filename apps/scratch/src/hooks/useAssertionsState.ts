import { useEffect, useState } from "react";
import VM from "scratch-vm";
import { Assertion } from "../types/scratch-vm-custom";

interface AssertionsState {
  passedAssertions: Assertion[];
  failedAssertions: Assertion[];
}

export const useAssertionsState = (vm: VM): AssertionsState => {
  const [assertionsState, setAssertionsState] = useState<AssertionsState>({
    passedAssertions: [],
    failedAssertions: [],
  });

  useEffect(() => {
    const fn = (
      passedAssertions: Assertion[],
      failedAssertions: Assertion[],
    ): void => setAssertionsState({ passedAssertions, failedAssertions });

    vm.runtime.on("ASSERTIONS_CHECKED", fn);

    return (): void => {
      vm.runtime.off("ASSERTIONS_CHECKED", fn);
    };
  }, [vm, setAssertionsState]);

  return assertionsState;
};
