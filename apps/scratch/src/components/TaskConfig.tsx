import React, { FormEvent, useCallback, useEffect } from "react";

import VM, { ScratchCrtConfig } from "scratch-vm";
import Modal from "./modal/Modal";
import { allowAllBlocks, allowNoBlocks } from "../blocks/make-toolbox-xml";
import { UpdateBlockToolboxEvent } from "../events/update-block-toolbox";

const TaskConfig = ({
  vm,
  isShown,
  hideModal,
}: {
  vm: VM;
  isShown?: boolean;
  hideModal: () => void;
}) => {
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

      updateConfig(e, () => {});

      hideModal();
    },
    [vm],
  );

  useEffect(() => {
    // every time the modal is opened, load the form values based on the config
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
