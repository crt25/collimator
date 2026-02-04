import { useCallback, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Dialog, Portal, Text } from "@chakra-ui/react";
import Button from "../Button";
import Select from "../form/Select";
import { ModalMessages } from "@/i18n/modal-messages";
import { useAllClasses } from "@/api/collimator/hooks/classes/useAllClasses";
import { useAllClassSessions } from "@/api/collimator/hooks/sessions/useAllClassSessions";
import { useCopySession } from "@/api/collimator/hooks/sessions/useCopySession";

const messages = defineMessages({
  title: {
    id: "CopyLessonModal.title",
    defaultMessage: "Copy existing lesson",
  },
  description: {
    id: "CopyLessonModal.description",
    defaultMessage: "Select an existing lesson to copy from another class.",
  },
  classLabel: {
    id: "CopyLessonModal.classLabel",
    defaultMessage: "Class",
  },
  classPlaceholder: {
    id: "CopyLessonModal.classPlaceholder",
    defaultMessage: "Select a class",
  },
  lessonLabel: {
    id: "CopyLessonModal.lessonLabel",
    defaultMessage: "Lesson",
  },
  lessonPlaceholder: {
    id: "CopyLessonModal.lessonPlaceholder",
    defaultMessage: "Select a lesson",
  },
  copyButton: {
    id: "CopyLessonModal.copyButton",
    defaultMessage: "Copy",
  },
  loading: {
    id: "CopyLessonModal.loading",
    defaultMessage: "Loading…",
  },
  networkError: {
    id: "CopyLessonModal.networkError",
    defaultMessage:
      "There was a network issue. Please close this dialog and try again later.",
  },
});

interface CopyLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClassId: number;
}

const CopyLessonModal = ({
  isOpen,
  onClose,
  targetClassId,
}: CopyLessonModalProps) => {
  const intl = useIntl();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: classes,
    error: classesError,
    isLoading: isLoadingClasses,
  } = useAllClasses();

  const selectedClassIdNumber = selectedClassId
    ? parseInt(selectedClassId, 10)
    : null;

  const {
    data: sessions,
    error: sessionsError,
    isLoading: isLoadingSessions,
  } = useAllClassSessions(selectedClassIdNumber);

  const hasError = !!classesError || !!sessionsError;

  const copySession = useCopySession();

  const classOptions = useMemo(
    () =>
      classes?.map((c) => ({
        value: c.id.toString(),
        label: c.name,
      })) ?? [],
    [classes],
  );

  const sessionOptions = useMemo(
    () =>
      sessions?.map((s) => ({
        value: s.id.toString(),
        label: s.title,
      })) ?? [],
    [sessions],
  );

  const handleClassChange = useCallback((value: string) => {
    setSelectedClassId(value);
    setSelectedSessionId("");
  }, []);

  const handleSessionChange = useCallback((value: string) => {
    setSelectedSessionId(value);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedClassId("");
    setSelectedSessionId("");
    onClose();
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    if (!selectedSessionId) return;

    setIsSubmitting(true);
    try {
      await copySession(targetClassId, parseInt(selectedSessionId, 10));
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSessionId, targetClassId, copySession, handleClose]);

  const canSubmit =
    selectedClassId && selectedSessionId && !isSubmitting && !hasError;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && handleClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="copy-lesson-modal">
            <Dialog.Header>
              <Dialog.Title>
                <FormattedMessage {...messages.title} />
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {hasError ? (
                <Text>
                  <FormattedMessage {...messages.networkError} />
                </Text>
              ) : (
                <>
                  <Text marginBottom="md">
                    <FormattedMessage {...messages.description} />
                  </Text>

                  <Select
                    options={classOptions}
                    value={selectedClassId}
                    onValueChange={handleClassChange}
                    label={messages.classLabel}
                    placeholder={
                      isLoadingClasses
                        ? messages.loading
                        : messages.classPlaceholder
                    }
                    disabled={isLoadingClasses}
                    alwaysShow
                    insideDialog
                    data-testid="copy-lesson-class-select"
                  />

                  <Select
                    options={sessionOptions}
                    value={selectedSessionId}
                    onValueChange={handleSessionChange}
                    label={messages.lessonLabel}
                    placeholder={
                      isLoadingSessions
                        ? messages.loading
                        : messages.lessonPlaceholder
                    }
                    disabled={!selectedClassId || isLoadingSessions}
                    alwaysShow
                    insideDialog
                    data-testid="copy-lesson-session-select"
                  />
                </>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={handleClose}
                variant="secondary"
                data-testid="copy-lesson-cancel-button"
              >
                {intl.formatMessage(ModalMessages.cancel)}
              </Button>
              <Button
                onClick={handleCopy}
                variant="primary"
                disabled={!canSubmit}
                data-testid="copy-lesson-confirm-button"
              >
                {intl.formatMessage(messages.copyButton)}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CopyLessonModal;
