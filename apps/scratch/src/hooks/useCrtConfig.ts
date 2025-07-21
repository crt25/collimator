import { useEffect, useState } from "react";
import VM from "scratch-vm";
import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { defaultCrtConfig } from "../vm/default-crt-config";

export const useCrtConfig = (vm: VM | null): ScratchCrtConfig => {
  const [crtConfig, setCrtConfig] = useState(vm?.crtConfig ?? defaultCrtConfig);

  useEffect(() => {
    if (crtConfig === defaultCrtConfig && vm?.crtConfig !== undefined) {
      setCrtConfig(vm.crtConfig);
    }

    vm?.runtime.on("CRT_CONFIG_CHANGED", setCrtConfig);

    return (): void => {
      vm?.runtime.off("CRT_CONFIG_CHANGED", setCrtConfig);
    };
  }, [vm, crtConfig]);

  return crtConfig;
};
