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
  teacherHeader: {
    id: "Home.header",
    defaultMessage: "Teacher Dashboard",
  },
  teacherDescription: {
    id: "Home.description",
    defaultMessage: "Welcome to the Teacher Dashboard of Collimator.",
  },
  adminHeader: {
    id: "Home.header",
    defaultMessage: "Admin Dashboard",
  },
  adminDescription: {
    id: "Home.description",
    defaultMessage: "Welcome to the Admin Dashboard of Collimator.",
  },
  classesDescription: {
    id: "Home.classesDescription",
    defaultMessage: "Manage your classes and students.",
  },
  usersDescription: {
    id: "Home.usersDescription",
    defaultMessage: "Manage user accounts and permissions.",
  },
  tasksDescription: {
    id: "Home.tasksDescription",
    defaultMessage: "Create and manage tasks for your classes.",
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
  const header = isAdmin ? messages.adminHeader : messages.teacherHeader;
  const description = isAdmin
    ? messages.adminDescription
    : messages.teacherDescription;

  return (
    <>
      <Header title={header} />
      <Container>
        <PageHeading>
          <FormattedMessage {...header} />
        </PageHeading>
        <PageHeading variant="description">
          <FormattedMessage {...description} />
        </PageHeading>

        <GridLayout>
          <GridItem>
            <Card.Root variant="full" onClick={() => router.push("/class")}>
              <Card.Body>
                <PageHeading variant="subHeading">Classes</PageHeading>
                <Text>
                  <FormattedMessage {...messages.classesDescription} />
                </Text>
              </Card.Body>
            </Card.Root>
          </GridItem>

          {isAdmin && (
            <GridItem>
              <Card.Root variant="full" onClick={() => router.push("/user")}>
                <Card.Body>
                  <PageHeading variant="subHeading">Users</PageHeading>
                  <Text>
                    <FormattedMessage {...messages.usersDescription} />
                  </Text>
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
                  <FormattedMessage {...messages.tasksDescription} />
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
