import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import MaxScreenHeightInModal from "../layout/MaxScreenHeightInModal";
import styled from "@emotion/styled";
import { ReactNode, useCallback, useRef, useState } from "react";
import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import Button, { ButtonVariant } from "../Button";
import { Language } from "@/types/app-iframe-message/languages";

const LargeModal = styled(Modal)`
  & > .modal-dialog {
    max-width: calc(100% - 2 * var(--bs-modal-margin));
  }
`;

const ModalBody = styled(Modal.Body)`
  display: flex;

  & > {
    min-height: 0;
  }
`;

const TaskModal = ({
  title,
  url,
  isShown,
  setIsShown,
  loadContent,
  showResetButton,
  showImportButton,
  showExportButton,
  showSaveButton,
  onSave,
}: {
  title: ReactNode;
  url: string | null | undefined;
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  loadContent: (app: EmbeddedAppRef) => void;

  showResetButton?: boolean;
  showImportButton?: boolean;
  showExportButton?: boolean;
  showSaveButton?: boolean;
  onSave?: (blob: Blob) => void;
}) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);
  const intl = useIntl();

  const onImportTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const task = await readSingleFileFromDisk();

    await embeddedApp.current.sendRequest({
      procedure: "loadTask",
      arguments: {
        task,
        language: intl.locale as Language,
      },
    });
  }, [intl.locale]);

  const onExportTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getTask",
    });

    downloadBlob(response.result, "task.sb3");
  }, []);

  const loadAppData = useCallback(() => {
    if (embeddedApp.current) {
      loadContent(embeddedApp.current);

      setAppLoaded(true);
    }
  }, [loadContent]);

  return (
    <LargeModal
      show={isShown}
      onHide={() => setIsShown(false)}
      data-testid="task-modal"
    >
      <MaxScreenHeightInModal>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <ModalBody>
          {url && (
            <EmbeddedApp
              src={url}
              ref={embeddedApp}
              onAppAvailable={loadAppData}
            />
          )}
        </ModalBody>
        <Modal.Footer>
          {showResetButton && (
            <Button
              disabled={!appLoaded}
              onClick={loadAppData}
              variant={ButtonVariant.secondary}
              data-testid="reset-button"
            >
              <FormattedMessage id="TaskModal.reset" defaultMessage="Reset" />
            </Button>
          )}
          {showImportButton && (
            <Button
              disabled={!appLoaded}
              onClick={onImportTask}
              variant={ButtonVariant.secondary}
              data-testid="import-button"
            >
              <FormattedMessage
                id="TaskModal.import"
                defaultMessage="Import task"
              />
            </Button>
          )}
          {showExportButton && (
            <Button
              disabled={!appLoaded}
              onClick={onExportTask}
              variant={ButtonVariant.secondary}
              data-testid="export-button"
            >
              <FormattedMessage
                id="TaskModal.export"
                defaultMessage="Export task"
              />
            </Button>
          )}
          {showSaveButton && (
            <Button
              disabled={!appLoaded}
              onClick={async () => {
                if (embeddedApp.current && onSave) {
                  const task = await embeddedApp.current.sendRequest({
                    procedure: "getTask",
                  });

                  onSave(task.result);
                }
                setIsShown(false);
              }}
              variant={ButtonVariant.secondary}
              data-testid="save-button"
            >
              <FormattedMessage
                id="TaskModal.save"
                defaultMessage="Save task"
              />
            </Button>
          )}
        </Modal.Footer>
      </MaxScreenHeightInModal>
    </LargeModal>
  );
};

export default TaskModal;
