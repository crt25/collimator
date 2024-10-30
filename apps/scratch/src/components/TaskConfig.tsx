import { FormEvent, useCallback, useEffect, useState } from "react";

import VM from "scratch-vm";
import Modal from "./modal/Modal";

const TaskConfig = ({
  vm,
  isShown,
  hideModal,
}: {
  vm: VM;
  isShown?: boolean;
  hideModal: () => void;
}) => {
  const [canEditTaskBlocks, setCanEditTaskBlocks] = useState<boolean>(false);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const config = vm.crtConfig;

      if (!config) {
        console.error("No task config found");
        return;
      }

      config.canEditTaskBlocks = canEditTaskBlocks;

      hideModal();
    },
    [vm, canEditTaskBlocks],
  );

  useEffect(() => {
    // every time the modal is opened, load the latest config values
    setCanEditTaskBlocks(vm.crtConfig?.canEditTaskBlocks ?? true);
  }, [isShown]);

  return (
    <Modal isShown={isShown}>
      <h1>Task Config</h1>

      <form onSubmit={onSubmit} data-testid="task-config-form">
        <label>
          <span>Can the blocks provided with the task be edited?</span>
          <input
            type="checkbox"
            min="0"
            checked={canEditTaskBlocks}
            onChange={(e) => setCanEditTaskBlocks(e.target.checked)}
            data-testid="freeze-task-blocks-checkbox"
          />
        </label>

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
