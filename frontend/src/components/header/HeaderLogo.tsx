import { chakra } from "@chakra-ui/react";
import { ComponentProps } from "react";
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
  variants: {
    variant: {
      small: {
        fontSize: "lg",
      },
    },
  },
});

type Variants = ComponentProps<typeof Logo>["variant"];

const HeaderLogo = ({ variant }: { variant?: Variants }) => {
  const intl = useIntl();

  return <Logo variant={variant}>{intl.formatMessage(messages.logoName)}</Logo>;
};

export default HeaderLogo;
