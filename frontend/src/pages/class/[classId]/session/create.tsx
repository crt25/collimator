import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import SessionForm, {
  SessionFormValues,
} from "@/components/session/SessionForm";
import { useCreateSession } from "@/api/collimator/hooks/sessions/useCreateSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";
import ClassNavigation from "@/components/class/ClassNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";
import { toaster } from "@/components/Toaster";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "CreateSession.title",
    defaultMessage: "Create Lesson",
  },
  submit: {
    id: "CreateSession.submit",
    defaultMessage: "Create Lesson",
  },
  successMessage: {
    id: "CreateSession.successMessage",
    defaultMessage: "Lesson created successfully",
  },
  errorMessage: {
    id: "CreateSession.errorMessage",
    defaultMessage:
      "There was an error creating the new Lesson. Please try to save again!",
  },
  returnToSessionList: {
    id: "CreateSession.returnToSessionList",
    defaultMessage: "Return to Lesson List",
  },
});

const CreateSession = () => {
  const intl = useIntl();
  const router = useRouter();
  const createSession = useCreateSession();
  const { classId } = router.query as {
    classId: string;
  };
  const { data: klass, error, isLoading } = useClass(classId);

  const onSubmit = useCallback(
    async (formValues: SessionFormValues) => {
      if (klass) {
        try {
          const session = await createSession(klass.id, {
            title: formValues.title,
            description: formValues.description,
            taskIds: formValues.taskIds,
            isAnonymous: formValues.sharingType === "anonymous",
          });
          toaster.success({
            title: intl.formatMessage(messages.successMessage),
            action: {
              label: intl.formatMessage(messages.returnToSessionList),
              onClick: () => router.push(`/class/${klass.id}/session`),
            },
            meta: {
              actionTestId: "go-back-to-session-list",
            },
            closable: true,
          });
          router.push(`/class/${klass.id}/session/${session.id}/detail`);
        } catch {
          toaster.error({
            title: intl.formatMessage(messages.errorMessage),
          });
        }
      }
    },
    [intl, klass, createSession, router],
  );

  return (
    <MaxScreenHeight>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <PageHeading>
          <FormattedMessage
            id="CreateSession.header"
            defaultMessage="Create Lesson"
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
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default CreateSession;
