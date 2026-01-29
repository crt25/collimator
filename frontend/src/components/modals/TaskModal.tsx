import { ReactNode, useCallback, useRef, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { Language, Submission } from "iframe-rpc-react/src";
import { Dialog, Portal } from "@chakra-ui/react";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { executeAsyncWithToasts } from "@/utilities/task/task";
import { messages as taskMessages } from "@/i18n/task-messages";
import MaxScreenHeightInModal from "../layout/MaxScreenHeightInModal";
import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import Button from "../Button";

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

const LargeModal = styled(Dialog.Positioner)`
  & > * {
    margin: 1rem 0;
    max-width: calc(100% - 2rem);
  }
`;

const ModalBody = styled(Dialog.Body)`
  display: flex;
  padding: 0 1rem;

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
  onReceiveSubmission,
}: {
  title?: ReactNode;
  url: string | null | undefined;
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  loadContent: (app: EmbeddedAppRef) => void;

  showResetButton?: boolean;
  showImportButton?: boolean;
  showExportButton?: boolean;
  showSaveButton?: boolean;
  onSave?: (embeddedApp: EmbeddedAppRef) => Promise<void>;
  header?: React.ReactNode;
  footer?: React.ReactNode;

  onReceiveSubmission?: (submission: Submission) => void;
}) => {
  const [appLoaded, setAppLoaded] = useState(false);
  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);
  const intl = useIntl();

  const onImportTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    setAppLoaded(false);

    const task = await readSingleFileFromDisk();

    await executeAsyncWithToasts(
      () =>
        embeddedApp.current!.sendRequest("importTask", {
          task,
          language: intl.locale as Language,
        }),
      intl.formatMessage(taskMessages.taskImported),
      intl.formatMessage(taskMessages.cannotImportTask),
    );
    setAppLoaded(true);
  }, [intl]);

  const onExportTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await executeAsyncWithToasts(
      () => embeddedApp.current!.sendRequest("exportTask", undefined),
      intl.formatMessage(taskMessages.taskCreated),
      intl.formatMessage(taskMessages.cannotExport),
    );

    downloadBlob(response.result.file, response.result.filename);
  }, [intl]);

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
      <Dialog.Root open={isShown} onOpenChange={warnBeforeClose}>
        <Portal>
          <Dialog.Backdrop />
          <LargeModal>
            <Dialog.Content data-testid="task-modal">
              <MaxScreenHeightInModal>
                {(title || header) && (
                  <Dialog.Header paddingBottom="0">
                    <Dialog.Title>{title}</Dialog.Title>
                    {header}
                  </Dialog.Header>
                )}
                <ModalBody>
                  {url && (
                    <EmbeddedApp
                      src={url}
                      ref={embeddedApp}
                      onAppAvailable={loadAppData}
                      onReceiveSubmission={onReceiveSubmission}
                    />
                  )}
                </ModalBody>
                <Dialog.Footer>
                  {footer}
                  {showResetButton && (
                    <Button
                      disabled={!appLoaded}
                      onClick={loadAppData}
                      variant="secondary"
                      data-testid="reset-button"
                    >
                      <FormattedMessage
                        id="TaskModal.reset"
                        defaultMessage="Reset"
                      />
                    </Button>
                  )}
                  {showImportButton && (
                    <Button
                      disabled={!appLoaded}
                      onClick={onImportTask}
                      variant="secondary"
                      data-testid="import-button"
                    >
                      <FormattedMessage
                        id="TaskModal.import"
                        defaultMessage="Import"
                      />
                    </Button>
                  )}
                  {showExportButton && (
                    <Button
                      disabled={!appLoaded}
                      onClick={onExportTask}
                      variant="secondary"
                      data-testid="export-button"
                    >
                      <FormattedMessage
                        id="TaskModal.export"
                        defaultMessage="Export"
                      />
                    </Button>
                  )}
                  <Button
                    onClick={warnBeforeClose}
                    disabled={isSaving}
                    variant="danger"
                    data-testid="cancel-button"
                  >
                    <FormattedMessage
                      id="TaskModal.cancel"
                      defaultMessage="Cancel"
                    />
                  </Button>
                  {showSaveButton && (
                    <Button
                      disabled={!appLoaded || isSaving}
                      onClick={async () => {
                        if (embeddedApp.current && onSave) {
                          try {
                            setIsSaving(true);
                            await onSave(embeddedApp.current);
                            setIsShown(false);
                          } finally {
                            setIsSaving(false);
                          }
                        }
                      }}
                      variant="primary"
                      data-testid="save-button"
                    >
                      <FormattedMessage
                        id="TaskModal.save"
                        defaultMessage="Save"
                      />
                    </Button>
                  )}
                </Dialog.Footer>
              </MaxScreenHeightInModal>
            </Dialog.Content>
          </LargeModal>
        </Portal>
      </Dialog.Root>
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
