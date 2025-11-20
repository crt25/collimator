import { chakra } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  logoName: {
    id: "HeaderLogo.logoName",
    defaultMessage: "ClassMosaic",
  },
});

const Logo = chakra("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "2xl",
    fontWeight: "bold",

    "& img, & svg": {
      maxHeight: "{spacing.xl}",
      height: "100%",
      width: "auto",
    },
  },
});

const HeaderLogo = () => {
  const intl = useIntl();

  return <Logo>{intl.formatMessage(messages.logoName)}</Logo>;
};

export default HeaderLogo;
