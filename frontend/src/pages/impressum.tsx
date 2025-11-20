import Breadcrumbs from "@/components/Breadcrumbs";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/Header";
import PageFooter from "@/components/PageFooter";
import PageHeading from "@/components/PageHeading";
import { Box, Container, Heading, Link, Text } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  title: {
    id: "Impressum.title",
    defaultMessage: "Impressum",
  },
});

const Impressum = () => {
  return (
    <>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeading>
          <FormattedMessage id="Impressum.header" defaultMessage="Impressum" />
        </PageHeading>

        <Heading as="h2" mb="4">
          General Information
        </Heading>
        <Box>
          <Text fontWeight="bold">
            Haute école pédagogique du canton de Vaud (HEP Vaud)
          </Text>

          <Text>Avenue de Cour 33, 1014 Lausanne, Suisse</Text>

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

        <Heading as="h2" my="8">
          Application development
        </Heading>

        <Box>
          <Text fontWeight="bold">Anansi Solutions SA</Text>

          <Text>Av. Reller 32, 1804 Corsier-sur-Vevey, Suisse</Text>
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
          <Text>
            <Link variant="underline" href="https://anansi-solutions.net/">
              anansi-solutions.net
            </Link>
          </Text>
        </Box>
      </Container>
      <PageFooter />
    </>
  );
};

export default Impressum;
