import { useCallback, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Dialog, Portal, Text } from "@chakra-ui/react";
import { ModalMessages } from "@/i18n/modal-messages";
import { useAllClasses } from "@/api/collimator/hooks/classes/useAllClasses";
import { useAllClassSessions } from "@/api/collimator/hooks/sessions/useAllClassSessions";
import { useCopySession } from "@/api/collimator/hooks/sessions/useCopySession";
import Button from "../Button";
import Select from "../form/Select";

const messages = defineMessages({
  title: {
    id: "CopyLessonModal.title",
    defaultMessage: "Copy existing Lesson",
  },
  description: {
    id: "CopyLessonModal.description",
    defaultMessage:
      "Select an existing Lesson to copy from another class. The Tasks structure will be copied as well but without any data.",
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

  const { data: classes } = useAllClasses();
  const { data: sessions } = useAllClassSessions(
    selectedClassId ? parseInt(selectedClassId, 10) : 0,
  );

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
      await copySession(targetClassId, {
        sourceSessionId: parseInt(selectedSessionId, 10),
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSessionId, targetClassId, copySession, handleClose]);

  const canSubmit = selectedClassId && selectedSessionId && !isSubmitting;

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
              <Text marginBottom="md">
                <FormattedMessage {...messages.description} />
              </Text>

              <Select
                options={classOptions}
                value={selectedClassId}
                onValueChange={handleClassChange}
                label={messages.classLabel}
                placeholder={messages.classPlaceholder}
                alwaysShow
                data-testid="copy-lesson-class-select"
              />

              <Select
                options={sessionOptions}
                value={selectedSessionId}
                onValueChange={handleSessionChange}
                label={messages.lessonLabel}
                placeholder={messages.lessonPlaceholder}
                alwaysShow
                data-testid="copy-lesson-session-select"
              />
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
