import React, { FormEvent, useCallback, useEffect, useState } from "react";

import VM from "scratch-vm";
import Modal from "./modal/Modal";
import {
  allowAllStandardBlocks,
  allowNoBlocks,
} from "../blocks/make-toolbox-xml";
import { UpdateBlockToolboxEvent } from "../events/update-block-toolbox";
import { useAssertionsEnabled } from "../hooks/useAssertionsEnabled";
import { ExtensionId } from "../extensions";
import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { FormattedMessage } from "react-intl";

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

  const onAllowAllStandardBlocks = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      updateConfig(
        e,
        (config) => (config.allowedBlocks = allowAllStandardBlocks),
      );
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
      <h1>
        <FormattedMessage
          defaultMessage="Task Config"
          description="Heading of the task config modal."
          id="crt.taskConfig.heading"
        />
      </h1>

      <form onSubmit={onSubmit} data-testid="task-config-form">
        <button
          onClick={onAllowAllStandardBlocks}
          data-testid="allow-all-standard-blocks-button"
        >
          <FormattedMessage
            defaultMessage="Allow all standard blocks to be used"
            description="Label shown on the button that, when clicked, allows all standard blocks to be used by students."
            id="crt.taskConfig.heading"
          />
        </button>
        <button onClick={onAllowNoBlocks} data-testid="allow-no-blocks-button">
          <FormattedMessage
            defaultMessage="Disallow all blocks"
            description="Label shown on the button that, when clicked, disallows all blocks from being used by students."
            id="crt.taskConfig.heading"
          />
        </button>

        {isAssertionsExtensionEnabled && (
          <label>
            <span>
              <FormattedMessage
                defaultMessage="Enable assertions simulating a student solving the task."
                description="Label shown next to the checkbox that allows a teacher to simulate the assertion mode when editing."
                id="crt.taskConfig.heading"
              />
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
