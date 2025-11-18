import { Switch } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { useStudentAnonymization } from "@/hooks/useStudentAnonymization";

const AnonymizationToggle = () => {
  const [anonymizationState, setAnonymizationState] = useStudentAnonymization();

  return (
    <Switch.Root
      checked={!anonymizationState.showActualName}
      onCheckedChange={(e) =>
        setAnonymizationState({
          ...anonymizationState,
          showActualName: !e.checked,
        })
      }
      colorPalette="yellow"
      display="flex"
    >
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>
        <FormattedMessage
          id="AnonymizationToggle.label"
          defaultMessage="Anonymize Names"
        />
      </Switch.Label>
    </Switch.Root>
  );
};

export default AnonymizationToggle;
