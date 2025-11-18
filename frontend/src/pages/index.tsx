import { defineMessages, FormattedMessage } from "react-intl";
import { Grid, GridItem, Card, Container, chakra } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import Header from "@/components/Header";
import PageHeading from "@/components/PageHeading";
import { TextComponent as Text } from "@/components/Text";
import { UserRole } from "@/types/user/user-role";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";

const messages = defineMessages({
  header: {
    id: "Home.header",
    defaultMessage: "Teacher Dashboard",
  },
  description: {
    id: "Home.description",
    defaultMessage: "Welcome to the Teacher Dashboard of Collimator.",
  },
});

const GridLayout = chakra(Grid, {
  base: {
    marginTop: "4xl",
    gridTemplateColumns: {
      base: "1fr",
      md: "repeat(3, 1fr)",
    },

    gap: "xl",
    padding: "0",

    "& > *:nth-child(even)": {
      justifySelf: "end",
    },
  },
});

const Home = () => {
  const router = useRouter();
  const authContext = useContext(AuthenticationContext);

  const isAdmin = authContext.role === UserRole.admin || undefined;

  return (
    <>
      <Header title={messages.header} />
      <Container>
        <PageHeading>
          <FormattedMessage {...messages.header} />
        </PageHeading>
        <PageHeading variant="description">
          <FormattedMessage {...messages.description} />
        </PageHeading>

        <GridLayout>
          <GridItem>
            <Card.Root variant="full" onClick={() => router.push("/class")}>
              <Card.Body>
                <PageHeading variant="subHeading">Classes</PageHeading>
                <Text>
                  Aliquam cursus risus augue quis est. Lorem ipsum dolor sit
                  amet consectetur. Aliquam cursus risus augue quis est.
                </Text>
              </Card.Body>
            </Card.Root>
          </GridItem>

          {isAdmin && (
            <GridItem>
              <Card.Root variant="full" onClick={() => router.push("/user")}>
                <Card.Body>
                  <PageHeading variant="subHeading">Users</PageHeading>
                  <Text>Manage user accounts and permissions.</Text>
                </Card.Body>
              </Card.Root>
            </GridItem>
          )}

          <GridItem>
            <Card.Root variant="full" onClick={() => router.push("/lesson")}>
              <Card.Body>
                <PageHeading variant="subHeading">Task Templates</PageHeading>
                <Text>Copy template tasks to your classes lesson.</Text>
              </Card.Body>
            </Card.Root>
          </GridItem>

          <GridItem>
            <Card.Root variant="full" onClick={() => router.push("/task")}>
              <Card.Body>
                <PageHeading variant="subHeading">Create new Tasks</PageHeading>
                <Text>
                  Aliquam cursus risus augue quis est. Lorem ipsum dolor sit
                  amet consectetur. Aliquam cursus risus augue quis est.
                </Text>
              </Card.Body>
            </Card.Root>
          </GridItem>

          <GridItem>
            <Card.Root
              variant="full"
              onClick={() => router.push("/some-other-page")}
            >
              <Card.Body>
                <PageHeading variant="subHeading">Some other Page</PageHeading>
                <Text>
                  Aliquam cursus risus augue quis est. Lorem ipsum dolor sit
                  amet consectetur. Aliquam cursus risus augue quis est.
                </Text>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </GridLayout>
      </Container>
    </>
  );
};

export default Home;
