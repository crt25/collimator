import { useEffect, useState } from "react";
import VM from "scratch-vm";

export const useAssertionsEnabled = (vm: VM): boolean => {
  const [assertionsEnabled, setAssertionsEnabled] = useState(false);

  useEffect(() => {
    const onAssertionsEnabled = (): void => setAssertionsEnabled(true);
    const onAssertionsDisabled = (): void => setAssertionsEnabled(false);

    vm.runtime.on("ASSERTIONS_ENABLED", onAssertionsEnabled);
    vm.runtime.on("ASSERTIONS_DISABLED", onAssertionsDisabled);
    vm.runtime.on("ARE_ASSERTIONS_ENABLED_RESPONSE", setAssertionsEnabled);

    // query for the current state. if we don't get a response, we'll assume assertions are disabled
    // which is the default state initialized above.
    vm.runtime.emit("ARE_ASSERTIONS_ENABLED_QUERY");

    return (): void => {
      vm.runtime.off("ASSERTIONS_ENABLED", onAssertionsEnabled);
      vm.runtime.off("ASSERTIONS_DISABLED", onAssertionsDisabled);
      vm.runtime.off("ARE_ASSERTIONS_ENABLED_RESPONSE", setAssertionsEnabled);
    };
  }, [vm, setAssertionsEnabled]);

  return assertionsEnabled;
};
