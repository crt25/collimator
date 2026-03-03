import { FormattedMessage, defineMessages } from "react-intl";
import { Badge, chakra } from "@chakra-ui/react";

const messages = defineMessages({
  public: {
    id: "PublicBadge.public",
    defaultMessage: "Public",
  },
});

const StyledPublicBadge = chakra(Badge, {
  base: {
    colorPalette: "green",
    marginLeft: "sm",
  },
});

export const PublicBadge = () => {
  return (
    <StyledPublicBadge>
      <FormattedMessage {...messages.public} />
    </StyledPublicBadge>
  );
};
