import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/Header";
import SessionForm, {
  SessionFormValues,
} from "@/components/session/SessionForm";
import { useCreateSession } from "@/api/collimator/hooks/sessions/useCreateSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";
import ClassNavigation from "@/components/class/ClassNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";

const messages = defineMessages({
  title: {
    id: "CreateSession.title",
    defaultMessage: "Create Session",
  },
  submit: {
    id: "CreateSession.submit",
    defaultMessage: "Create Session",
  },
});

const CreateSession = () => {
  const router = useRouter();
  const createSession = useCreateSession();

  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  const onSubmit = useCallback(
    async (formValues: SessionFormValues) => {
      if (klass) {
        await createSession(klass.id, {
          title: formValues.title,
          description: formValues.description,
          taskIds: formValues.taskIds,
          isAnonymous: formValues.isAnonymous,
        });

        router.back();
      }
    },
    [klass, createSession, router],
  );

  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <PageHeading>
          <FormattedMessage
            id="CreateSession.header"
            defaultMessage="Create Session"
          />
        </PageHeading>
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(
            // we need the class to submit the form
            _klass,
          ) => (
            <SessionForm submitMessage={messages.submit} onSubmit={onSubmit} />
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default CreateSession;
