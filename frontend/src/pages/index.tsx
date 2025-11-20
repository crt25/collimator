import { defineMessages, FormattedMessage } from "react-intl";
import { Grid, GridItem, Card, Container, Link } from "@chakra-ui/react";
import { useContext } from "react";
import Header from "@/components/header/Header";
import PageHeading from "@/components/PageHeading";
import { TextComponent as Text } from "@/components/Text";
import { UserRole } from "@/types/user/user-role";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import PageFooter from "@/components/PageFooter";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";

const messages = defineMessages({
  teacherHeader: {
    id: "Home.header",
    defaultMessage: "Teacher Dashboard",
  },
  teacherDescription: {
    id: "Home.description",
    defaultMessage: "Welcome to the Teacher Dashboard of ClassMosaic.",
  },
  adminHeader: {
    id: "Home.adminHeader",
    defaultMessage: "Admin Dashboard",
  },
  adminDescription: {
    id: "Home.adminDescription",
    defaultMessage:
      "Welcome to the Admin Dashboard of ClassMosaic. " +
      "Edit classes, tasks, or manage user profiles.",
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

const Home = () => {
  const authContext = useContext(AuthenticationContext);

  const isAdmin = authContext.role === UserRole.admin || undefined;
  const header = isAdmin ? messages.adminHeader : messages.teacherHeader;
  const description = isAdmin
    ? messages.adminDescription
    : messages.teacherDescription;

  return (
    <MaxScreenHeight>
      <Header title={header} />
      <Container>
        <PageHeading description={<FormattedMessage {...description} />}>
          <FormattedMessage {...header} />
        </PageHeading>

        <Grid marginBottom="lg" templateColumns="repeat(12, 1fr)" gap="md">
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <Link display="block" href="/class">
              <Card.Root variant="dashboard" size="lg">
                <Card.Body>
                  <Text
                    marginTop="md"
                    fontSize="3xl"
                    fontWeight="semiBold"
                    wordBreak="keep-all"
                    whiteSpace="nowrap"
                  >
                    <FormattedMessage
                      id="Home.classes"
                      defaultMessage="Classes"
                    />
                  </Text>
                  <Text>
                    <FormattedMessage {...messages.classesDescription} />
                  </Text>
                </Card.Body>
              </Card.Root>
            </Link>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <Link display="block" href="/task">
              <Card.Root variant="dashboard" size="lg">
                <Card.Body>
                  <Text
                    marginTop="md"
                    fontSize="3xl"
                    fontWeight="semiBold"
                    wordBreak="keep-all"
                    whiteSpace="nowrap"
                  >
                    <FormattedMessage id="Home.tasks" defaultMessage="Tasks" />
                  </Text>
                  <Text>
                    <FormattedMessage {...messages.tasksDescription} />
                  </Text>
                </Card.Body>
              </Card.Root>
            </Link>
          </GridItem>

          {isAdmin && (
            <GridItem colSpan={{ base: 12, lg: 6 }}>
              <Link display="block" href="/user">
                <Card.Root variant="dashboard" size="lg">
                  <Card.Body>
                    <Text
                      marginTop="md"
                      fontSize="3xl"
                      fontWeight="semiBold"
                      wordBreak="keep-all"
                      whiteSpace="nowrap"
                    >
                      <FormattedMessage
                        id="Home.users"
                        defaultMessage="Users"
                      />
                    </Text>
                    <Text>
                      <FormattedMessage {...messages.usersDescription} />
                    </Text>
                  </Card.Body>
                </Card.Root>
              </Link>
            </GridItem>
          )}
        </Grid>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default Home;
