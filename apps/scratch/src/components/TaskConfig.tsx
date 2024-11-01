import React, { FormEvent, useCallback, useEffect, useState } from "react";

import VM, { ScratchCrtConfig } from "scratch-vm";
import Modal from "./modal/Modal";
import { allowAllBlocks, allowNoBlocks } from "../blocks/make-toolbox-xml";
import { UpdateBlockToolboxEvent } from "../events/update-block-toolbox";
import { useAssertionsEnabled } from "../hooks/useAssertionsEnabled";
import { ExtensionId } from "../extensions";

const TaskConfig = ({
  vm,
  isShown,
  hideModal,
}: {
  vm: VM;
  isShown?: boolean;
  hideModal: () => void;
}) => {
  const assertionsEnabled = useAssertionsEnabled(vm);
  const [isAssertionsExtensionEnabled, setIsAssertionsExtensionEnabled] =
    useState(false);

  const [enableAssertions, setEnableAssertions] = useState(false);

  const updateConfig = useCallback(
    (
      e: React.SyntheticEvent,
      updateFunction: (config: ScratchCrtConfig) => void,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const config = vm.crtConfig;

      if (!config) {
        console.error("No task config found");
        return;
      }

      updateFunction(config);

      // update toolbox
      window.dispatchEvent(new UpdateBlockToolboxEvent());
    },
    [vm],
  );

  const onAllowAllBlocks = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      updateConfig(e, (config) => (config.allowedBlocks = allowAllBlocks));
    },
    [updateConfig],
  );

  const onAllowNoBlocks = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
      updateConfig(e, (config) => (config.allowedBlocks = allowNoBlocks)),
    [updateConfig],
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      updateConfig(e, () => {
        // update assertions
        if (isAssertionsExtensionEnabled) {
          vm.runtime.emit(
            enableAssertions ? "ENABLE_ASSERTIONS" : "DISABLE_ASSERTIONS",
          );
        }
      });

      hideModal();
    },
    [
      vm,
      isAssertionsExtensionEnabled,
      enableAssertions,
      updateConfig,
      hideModal,
    ],
  );

  useEffect(() => {
    // every time the modal is opened, load the form values based on the config
    setIsAssertionsExtensionEnabled(
      vm.extensionManager.isExtensionLoaded(ExtensionId.Assertions),
    );

    setEnableAssertions(assertionsEnabled);
  }, [isShown]);

  return (
    <Modal isShown={isShown}>
      <h1>Task Config</h1>

      <form onSubmit={onSubmit} data-testid="task-config-form">
        <button
          onClick={onAllowAllBlocks}
          data-testid="allow-all-blocks-button"
        >
          Allow all blocks to be used
        </button>
        <button onClick={onAllowNoBlocks} data-testid="allow-no-blocks-button">
          Disallow any block to be used
        </button>

        {isAssertionsExtensionEnabled && (
          <label>
            <span>
              Enable assertions simulating a student solving the task.
            </span>
            <input
              type="checkbox"
              min="0"
              checked={enableAssertions}
              onChange={(e) => setEnableAssertions(e.target.checked)}
              data-testid="enable-assertions-checkbox"
            />
          </label>
        )}

        <input
          type="submit"
          value="Save"
          data-testid="task-config-form-submit-button"
        />
      </form>
    </Modal>
  );
};

export default TaskConfig;
