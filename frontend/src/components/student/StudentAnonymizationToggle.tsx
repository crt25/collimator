import { Form } from "react-bootstrap";
import { defineMessages, useIntl } from "react-intl";
import { useStudentAnonymization } from "@/hooks/useStudentAnonymization";

const messages = defineMessages({
  showActualStudentNames: {
    id: "StudentAnonymizationToggle.showActualStudentNames",
    defaultMessage: "Show actual student names",
  },
});

export const StudentAnonymizationToggle = () => {
  const intl = useIntl();
  const [anonymizationState, setAnonymizationState] = useStudentAnonymization();

  return (
    <Form.Check
      type="switch"
      label={intl.formatMessage(messages.showActualStudentNames)}
      checked={anonymizationState.showActualName}
      onChange={() =>
        setAnonymizationState({
          ...setAnonymizationState,
          showActualName: !anonymizationState.showActualName,
        })
      }
    />
  );
};
