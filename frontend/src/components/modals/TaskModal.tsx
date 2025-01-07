import { ReactNode, useCallback, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import { Language } from "@/types/app-iframe-message/languages";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button, { ButtonVariant } from "../Button";
import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import MaxScreenHeightInModal from "../layout/MaxScreenHeightInModal";

const messages = defineMessages({
  closeConfirmation: {
    id: "TaskModal.closeConfirmation",
    defaultMessage: "Are you sure you want to close without saving?",
  },
  closeConfirmationTitle: {
    id: "TaskForm.closeConfirmation.title",
    defaultMessage: "Attention: you may lose your work!",
  },
  closeConfirmationBody: {
    id: "TaskForm.closeConfirmation.body",
    defaultMessage:
      "You are about to leave the task editing interface without saving.\nAre you sure this is" +
      " what you want?",
  },
  closeConfirmationButton: {
    id: "TaskForm.closeConfirmation.button",
    defaultMessage: "Yes, I don't need to save.",
  },
});

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
  header,
  footer,
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
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);
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

  const warnBeforeClose = useCallback(() => {
    if (showSaveButton && appLoaded) {
      setShowQuitNoSaveModal(true);
    } else {
      setIsShown(false);
    }
  }, [showSaveButton, appLoaded, setIsShown]);

  return (
    <>
      <LargeModal
        show={isShown}
        onHide={warnBeforeClose}
        data-testid="task-modal"
      >
        <MaxScreenHeightInModal>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
            {header}
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
            {footer}
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
      <ConfirmationModal
        isShown={showQuitNoSaveModal}
        setIsShown={setShowQuitNoSaveModal}
        onConfirm={() => {
          setIsShown(false);
        }}
        isDangerous
        messages={{
          title: messages.closeConfirmationTitle,
          body: messages.closeConfirmationBody,
          confirmButton: messages.closeConfirmationButton,
        }}
      />
    </>
  );
};

export default TaskModal;
