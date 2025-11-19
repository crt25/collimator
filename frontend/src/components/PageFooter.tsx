import { Box, Container, Link, Stack } from "@chakra-ui/react";
import { Fragment } from "react";

// TODO
//import { defineMessages } from "react-intl";
// const messages = defineMessages({
//   hepLink: {
//     id: "FooterLink.hepLink",
//     defaultMessage: "HEP Vaud",
//   },
// });

type FooterLink = {
  url: string;
  title: string;
};

const links: FooterLink[] = [
  {
    url: "#",
    title: "Impressum",
  },
  {
    url: "https://www.hepl.ch/accueil/mentions/mentions-legales.html",
    title: "Terms of Use",
  },
  {
    url: "https://www.hepl.ch",
    // title: (intl) => intl.formatMessage(messages.hepLink),
    title: "HEP Vaud",
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
  return (
    <Stack
      direction={{ smDown: "column", md: "row" }}
      gap="10"
      justifyContent={"flex-end"}
      alignContent={"center"}
      height={"100%"}
    >
      {links.map((item, index) => (
        <Fragment key={index}>
          <Link href={item.url} variant="plain" fontWeight="bold">
            {item.title}
          </Link>
        </Fragment>
      ))}
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
