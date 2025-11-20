import { Box, Container, Heading, Link, Text } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";
import PageHeading from "@/components/PageHeading";

const messages = defineMessages({
  title: {
    id: "Impressum.title",
    defaultMessage: "Impressum",
  },
});

const Impressum = () => {
  return (
    <MaxScreenHeight>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeading>
          <FormattedMessage id="Impressum.header" defaultMessage="Impressum" />
        </PageHeading>

        <Heading as="h2" mb="4">
          <FormattedMessage
            id={"impressum.generalInformation"}
            defaultMessage="General Information"
          />
        </Heading>
        <Box>
          <Text fontWeight="bold">
            Haute école pédagogique du canton de Vaud (HEP Vaud)
          </Text>

          <Text>
            Avenue de Cour 33
            <br />
            1014 Lausanne
            <br />
            <FormattedMessage
              id={"impressum.switzerland"}
              defaultMessage="Switzerland"
            />
          </Text>

          <Text>
            <Link variant="plain" href="mailto:info@hepl.ch">
              info(at)hepl.ch
            </Link>
          </Text>
          <Text>
            <Link variant="plain" href="tel:+41213169270">
              +41 21 316 92 70
            </Link>
          </Text>
          <Text>
            <Link variant="underline" href="https://www.hepl.ch">
              www.hepl.ch
            </Link>
          </Text>
        </Box>

        <Heading as="h2" mt="8" mb="4">
          <FormattedMessage
            id={"impressum.projectSponsor"}
            defaultMessage="Project Sponsor"
          />
        </Heading>
        <Box>
          <Text fontWeight="bold">Pr. Engin Bumbacher</Text>
          <Text>
            <Link
              variant="underline"
              href="https://www.hepl.ch/annuaire/engin.bumbacher"
            >
              HEP profile
            </Link>
          </Text>
        </Box>

        <Heading as="h2" mt="8" mb="4">
          <FormattedMessage id={"impressum.hosting"} defaultMessage="Hosting" />
        </Heading>
        <Box>
          <Text>
            <FormattedMessage
              id={"impressum.hostingProvider"}
              defaultMessage="Amazon Web Services, Inc. - Zurich Region"
            />
          </Text>
        </Box>

        <Heading as="h2" mt="8" mb="4">
          <FormattedMessage
            id={"impressum.softwareDevelopment"}
            defaultMessage="Software Development"
          />
        </Heading>

        <Box>
          <Text fontWeight="bold">Anansi Solutions SA</Text>

          <Text>
            Av. Reller 32
            <br />
            1804 Corsier-sur-Vevey
            <br />
            <FormattedMessage
              id={"impressum.switzerland"}
              defaultMessage="Switzerland"
            />
          </Text>
          {/*
          <Text>
            <Link variant="plain" href="mailto:contact@excellent.engineering">
              contact@excellent.engineering
            </Link>
          </Text>
          <Text>
            <Link variant="plain" href="tel:+41215613677">
              +41 21 561 36 77
            </Link>
          </Text>
          */}
          <Text>
            <Link variant="underline" href="https://anansi-solutions.net/">
              anansi-solutions.net
            </Link>
          </Text>
        </Box>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default Impressum;
