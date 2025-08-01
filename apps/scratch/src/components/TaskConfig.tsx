import React, { FormEvent, useCallback, useEffect, useState } from "react";

import VM from "scratch-vm";
import { FormattedMessage } from "react-intl";
import styled from "@emotion/styled";
import {
  allowAllStandardBlocks,
  allowNoBlocks,
} from "../blocks/make-toolbox-xml";
import { UpdateBlockToolboxEvent } from "../events/update-block-toolbox";
import { useAssertionsEnabled } from "../hooks/useAssertionsEnabled";
import { ExtensionId } from "../extensions";
import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { defaultMaximumExecutionTimeInMs } from "../utilities/constants";
import Modal from "./modal/Modal";

const Label = styled.label`
  display: flex !important;

  span {
    margin-bottom: 0rem !important;
  }

  input {
    margin-left: 0.5rem;
  }
`;

const TaskConfig = ({
  vm,
  isShown,
  hideModal,
}: {
  vm: VM;
  isShown?: boolean;
  hideModal: () => void;
}) => {
  // TODO: As this grows it may be worth using react-hook-form analogous to the frontend project.
  // TODO: Moreover, we should trigger the 'CRT_CONFIG_CHANGED' event on every change to the config.
  const assertionsEnabled = useAssertionsEnabled(vm);
  const [isAssertionsExtensionEnabled, setIsAssertionsExtensionEnabled] =
    useState(false);

  const [maximumExecutionTimeInS, setMaximumExecutionTimeInS] = useState(
    defaultMaximumExecutionTimeInMs / 1000,
  );
  const [enableAssertions, setEnableAssertions] = useState(false);
  const [allowCustomProcedureBlocks, setAllowCustomProcedureBlocks] =
    useState(false);
  const [allowVariableBlocks, setAllowVariableBlocks] = useState(false);
  const [enableStageInteractions, setEnableStageInteractions] = useState(true);

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

      setAllowCustomProcedureBlocks(true);
      setAllowVariableBlocks(true);
    },
    [updateConfig],
  );

  useEffect(() => {
    if (!vm.crtConfig) {
      console.error("No task config found");
      return;
    }

    setAllowCustomProcedureBlocks(
      vm.crtConfig.allowedBlocks.customBlocks ?? false,
    );
    setAllowVariableBlocks(vm.crtConfig.allowedBlocks.variables ?? false);
    setMaximumExecutionTimeInS(
      (vm.crtConfig?.maximumExecutionTimeInMs ??
        defaultMaximumExecutionTimeInMs) / 1000,
    );
    setEnableStageInteractions(vm.crtConfig?.enableStageInteractions ?? true);
  }, [
    vm.crtConfig,
    vm.crtConfig?.allowedBlocks.customBlocks,
    vm.crtConfig?.allowedBlocks.variables,
    vm.crtConfig?.maximumExecutionTimeInMs,
    vm.crtConfig?.enableStageInteractions,
  ]);

  const onAllowNoBlocks = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setAllowCustomProcedureBlocks(false);
      setAllowVariableBlocks(false);
      updateConfig(e, (config) => (config.allowedBlocks = allowNoBlocks));
    },
    [updateConfig],
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      updateConfig(e, (config) => {
        config.maximumExecutionTimeInMs = parseInt(
          (maximumExecutionTimeInS * 1000).toString(),
        );

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
    <Modal isShown={isShown} onHide={hideModal}>
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
            id="crt.taskConfig.allowAllStandardBlocks"
          />
        </button>
        <button onClick={onAllowNoBlocks} data-testid="allow-no-blocks-button">
          <FormattedMessage
            defaultMessage="Disallow all blocks"
            description="Label shown on the button that, when clicked, disallows all blocks from being used by students."
            id="crt.taskConfig.disallowAllBlocks"
          />
        </button>
        <Label>
          <FormattedMessage
            defaultMessage="Allow variable blocks"
            description="Label for checkbox to allow variables in task"
            id="crt.taskConfig.allowVariableBlocks"
          />
          <input
            checked={allowVariableBlocks}
            type="checkbox"
            onChange={(e) => {
              setAllowVariableBlocks(e.target.checked);
              vm.crtConfig!.allowedBlocks.variables = e.target.checked;
            }}
          />
        </Label>
        <Label>
          <FormattedMessage
            defaultMessage="Allow 'My Blocks' custom procedures"
            description="Label for checkbox to allow custom procedures in task"
            id="crt.taskConfig.allowCustomProcedureBlocks"
          />
          <input
            checked={allowCustomProcedureBlocks}
            type="checkbox"
            onChange={(e) => {
              setAllowCustomProcedureBlocks(e.target.checked);
              vm.crtConfig!.allowedBlocks.customBlocks = e.target.checked;
            }}
          />
        </Label>
        <Label>
          <FormattedMessage
            defaultMessage="Enable students to interact with the stage"
            description="Label for checkbox to enable stage interactions in task"
            id="crt.taskConfig.enableStageInteractions"
          />
          <input
            checked={enableStageInteractions}
            type="checkbox"
            onChange={(e) => {
              setEnableStageInteractions(e.target.checked);
              vm.crtConfig!.enableStageInteractions = e.target.checked;
            }}
          />
        </Label>

        {isAssertionsExtensionEnabled && (
          <>
            <Label>
              <FormattedMessage
                defaultMessage="Enable assertions simulating a student solving the task."
                description="Label shown next to the checkbox that allows a teacher to simulate the assertion mode when editing."
                id="crt.taskConfig.enableAssertions"
              />
              <input
                type="checkbox"
                min="0"
                checked={enableAssertions}
                onChange={(e) => setEnableAssertions(e.target.checked)}
                data-testid="enable-assertions-checkbox"
              />
            </Label>

            <Label>
              <FormattedMessage
                defaultMessage="Maximum execution time in seconds."
                description="Label shown next to the input field for setting the maximum execution time."
                id="crt.taskConfig.maximumExecutionTime"
              />
              <input
                type="number"
                min="0"
                max="120"
                value={maximumExecutionTimeInS}
                onChange={(e) =>
                  setMaximumExecutionTimeInS(parseFloat(e.target.value))
                }
                data-testid="maximum-execution-time-input"
              />
            </Label>
          </>
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
