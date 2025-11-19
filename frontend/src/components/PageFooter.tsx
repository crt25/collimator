import { Box, Container, Link, Stack } from "@chakra-ui/react";
import { Fragment } from "react";

import { defineMessages, IntlShape, useIntl } from "react-intl";

const messages = defineMessages({
  hepLink: {
    id: "FooterLink.hepLink",
    defaultMessage: "HEP Vaud",
  },
  termsLink: {
    id: "FooterLink.termsLink",
    defaultMessage: "Terms of Use",
  },
  impressumLink: {
    id: "FooterLink.impressumLink",
    defaultMessage: "Impressum",
  },
});

type FooterLink = {
  url: string;
  title: (intl: IntlShape, args: T) => string;
};

const links: FooterLink[] = [
  {
    url: "#",
    title: (intl) => intl.formatMessage(messages.impressumLink),
  },
  {
    url: "https://www.hepl.ch/accueil/mentions/mentions-legales.html",
    title: (intl) => intl.formatMessage(messages.termsLink),
  },
  {
    url: "https://www.hepl.ch",
    title: (intl) => intl.formatMessage(messages.hepLink),
  },
];

const FooterRoot = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box bg={"footerBg"} height={"6rem"}>
      <Container height={"100%"}>{children}</Container>
    </Box>
  );
};

const FooterList = () => {
  const intl = useIntl();

  return (
    <Stack
      direction={{ smDown: "column", md: "row" }}
      gap="10"
      justifyContent={"flex-end"}
      alignContent={"center"}
      height={"100%"}
    >
      {links.map((item, index) => {
        const title = item.title(intl);

        return (
          <Fragment key={index}>
            <Link href={item.url} variant="plain" fontWeight="bold">
              {title}
            </Link>
          </Fragment>
        );
      })}
    </Stack>
  );
};

const PageFooter = () => {
  const footer = (
    <FooterRoot>
      <FooterList />
    </FooterRoot>
  );

  return footer;
};

export default PageFooter;
