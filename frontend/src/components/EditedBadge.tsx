import { FormattedMessage, defineMessages } from "react-intl";
import { Badge, chakra } from "@chakra-ui/react";

const messages = defineMessages({
  edited: {
    id: "EditedBadge.edited",
    defaultMessage: "Edited",
  },
});

const EditBadge = chakra(Badge, {
  base: {
    colorPalette: "purple",
    marginLeft: "sm",
  },
});

export const EditedBadge = () => {
  return (
    <EditBadge>
      <FormattedMessage {...messages.edited} />
    </EditBadge>
  );
};
