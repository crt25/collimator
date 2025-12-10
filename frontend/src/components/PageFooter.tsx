import { Box, Container, Link, Stack } from "@chakra-ui/react";
import { Fragment } from "react";

import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
} from "react-intl";

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
  title: MessageDescriptor;
};

const links: FooterLink[] = [
  {
    url: "/impressum",
    title: messages.impressumLink,
  },
  {
    url: "https://www.hepl.ch/accueil/mentions/mentions-legales.html",
    title: messages.termsLink,
  },
  {
    url: "https://www.hepl.ch",
    title: messages.hepLink,
  },
];

const FooterRoot = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box mt="auto">
      <Box bg="footerBg" height={{ sm: "6rem" }} mt="4" py="4">
        <Container height="100%">{children}</Container>
      </Box>
    </Box>
  );
};

const FooterList = () => {
  return (
    <Stack
      direction={{ smDown: "column", md: "row" }}
      gap="10"
      justifyContent="flex-end"
      alignContent="center"
      height="100%"
    >
      {links.map((item, index) => {
        return (
          <Fragment key={index}>
            <Link href={item.url} variant="plain" fontWeight="bold">
              <FormattedMessage {...item.title} />
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
