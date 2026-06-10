import { useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { Icon } from "@chakra-ui/react";
import { LuStar } from "react-icons/lu";
import Button from "../Button";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { usePatchStudentSolutionIsReference } from "@/api/collimator/hooks/solutions/usePatchStudentSolutionIsReference";
import { Modal } from "@/components/form/Modal";
import { toaster } from "@/components/Toaster";

const messages = defineMessages({
  ariaLabel: {
    id: "UnstarPastSolutionsButton.ariaLabel",
    defaultMessage: "Remove all previously starred solutions",
  },
  confirmTitle: {
    id: "UnstarPastSolutionsButton.confirm.title",
    defaultMessage: "Remove previously starred solutions",
  },
  confirmBody: {
    id: "UnstarPastSolutionsButton.confirm.body",
    defaultMessage:
      "This will remove all previously starred solutions for this student. This action cannot be undone. Are you sure you want to continue?",
  },
  confirmButton: {
    id: "UnstarPastSolutionsButton.confirm.confirm",
    defaultMessage: "Remove",
  },
  cancelButton: {
    id: "UnstarPastSolutionsButton.confirm.cancel",
    defaultMessage: "Cancel",
  },
  successToast: {
    id: "UnstarPastSolutionsButton.successToast",
    defaultMessage: "Previously starred solutions removed.",
  },
  errorToast: {
    id: "UnstarPastSolutionsButton.errorToast",
    defaultMessage:
      "There was an error removing previously starred solutions. Please try again!",
  },
});

const UnstarPastSolutionsButton = ({
  classId,
  sessionId,
  taskId,
  taskSolutions,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  taskSolutions: ExistingStudentSolution[];
}) => {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const patchSolution = usePatchStudentSolutionIsReference();

  const starredPastSolutions = useMemo(() => {
    const latestSolution =
      ExistingStudentSolution.findSolutionToDisplay(taskSolutions);

    return taskSolutions.filter(
      (s) => s.isReference && s.id !== latestSolution?.id,
    );
  }, [taskSolutions]);

  if (starredPastSolutions.length === 0) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      await Promise.all(
        starredPastSolutions.map((s) =>
          patchSolution(classId, sessionId, taskId, s.id, {
            isReference: false,
          }),
        ),
      );
      toaster.success({
        id: `unstar-past-solutions-success-${taskId}`,
        title: intl.formatMessage(messages.successToast),
      });
    } catch {
      toaster.error({
        id: `unstar-past-solutions-error-${taskId}`,
        title: intl.formatMessage(messages.errorToast),
      });
    }
  };

  return (
    <>
      <Button
        aria-label={intl.formatMessage(messages.ariaLabel)}
        onClick={() => setIsModalOpen(true)}
        variant="ghost"
        padding="0"
      >
        <Icon size="lg" color="orange.500">
          <LuStar />
        </Icon>
      </Button>
      <Modal
        title={intl.formatMessage(messages.confirmTitle)}
        description={intl.formatMessage(messages.confirmBody)}
        confirmButtonText={intl.formatMessage(messages.confirmButton)}
        cancelButtonText={intl.formatMessage(messages.cancelButton)}
        onConfirm={handleConfirm}
        open={isModalOpen}
        onOpenChange={(details) => setIsModalOpen(details.open)}
      />
    </>
  );
};

export default UnstarPastSolutionsButton;
