import { Button, Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import MaxScreenHeightInModal from "../layout/MaxScreenHeightInModal";
import styled from "@emotion/styled";
import { useCallback, useRef } from "react";
import { scratchAppHostName } from "@/utilities/constants";
import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";

const LargeModal = styled(Modal)`
  & > .modal-dialog {
    max-width: calc(100% - 2 * var(--bs-modal-margin));
  }
`;

const EditTaskModal = ({
  isShown,
  setIsShown,
  onSave,
  initialTask,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  onSave: (blob: Blob) => void;
  initialTask?: Blob | null;
}) => {
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onImportTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const task = await readSingleFileFromDisk();

    await embeddedApp.current.sendRequest({
      procedure: "loadTask",
      arguments: task,
    });
  }, []);

  const onExportTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getTask",
    });

    downloadBlob(response.result, "task.sb3");
  }, []);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && initialTask) {
      embeddedApp.current.sendRequest({
        procedure: "loadTask",
        arguments: initialTask,
      });
    }
  }, [initialTask]);

  return (
    <LargeModal
      show={isShown}
      onHide={() => setIsShown(false)}
      data-testid="task-edit-modal"
    >
      <MaxScreenHeightInModal>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="EditTaskModal.title"
              defaultMessage="Edit task"
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EmbeddedApp
            src={`${scratchAppHostName}/edit`}
            ref={embeddedApp}
            onAppAvailable={onAppAvailable}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={onImportTask}
            variant="secondary"
            data-testid="import-button"
          >
            <FormattedMessage
              id="EditTaskModal.import"
              defaultMessage="Import task"
            />
          </Button>
          <Button
            onClick={onExportTask}
            variant="secondary"
            data-testid="export-button"
          >
            <FormattedMessage
              id="EditTaskModal.export"
              defaultMessage="Export task"
            />
          </Button>
          <Button
            onClick={async () => {
              if (embeddedApp.current) {
                const task = await embeddedApp.current.sendRequest({
                  procedure: "getTask",
                });

                onSave(task.result);
              }
              setIsShown(false);
            }}
            variant="primary"
            data-testid="save-button"
          >
            <FormattedMessage
              id="EditTaskModal.save"
              defaultMessage="Save task"
            />
          </Button>
        </Modal.Footer>
      </MaxScreenHeightInModal>
    </LargeModal>
  );
};

export default EditTaskModal;
