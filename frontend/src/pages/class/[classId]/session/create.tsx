import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import SessionForm, {
  SessionFormValues,
} from "@/components/session/SessionForm";
import { useCreateSession } from "@/api/collimator/hooks/sessions/useCreateSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";
import ClassNavigation from "@/components/class/ClassNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";

const messages = defineMessages({
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
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <PageHeader>
          <FormattedMessage
            id="CreateSession.header"
            defaultMessage="Create Session"
          />
        </PageHeader>
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
