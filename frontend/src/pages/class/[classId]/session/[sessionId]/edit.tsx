import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useUpdateClassSession } from "@/api/collimator/hooks/sessions/useUpdateClassSession";
import SessionNavigation from "@/components/session/SessionNavigation";
import MultiSwrContent from "@/components/MultiSwrContent";
import SessionForm, {
  SessionFormValues,
} from "@/components/session/SessionForm";
import PageHeading from "@/components/PageHeading";

const messages = defineMessages({
  title: {
    id: "EditSession.title",
    defaultMessage: "Edit Session - {title}",
  },
  submit: {
    id: "EditSession.submit",
    defaultMessage: "Save Session",
  },
});

const EditSession = () => {
  const router = useRouter();
  const { classId, sessionId } = router.query as {
    classId: string;
    sessionId: string;
  };

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const updateSession = useUpdateClassSession();

  const onSubmit = useCallback(
    async (formValues: SessionFormValues) => {
      if (klass && session) {
        await updateSession(klass.id, session.id, {
          title: formValues.title,
          description: formValues.description,
          taskIds: formValues.taskIds,
          isAnonymous: formValues.isAnonymous,
        });

        router.back();
      }
    },
    [klass, session, updateSession, router],
  );

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{
          title: session?.title ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation breadcrumb classId={klass?.id} session={session} />
        </Breadcrumbs>
        <SessionNavigation classId={klass?.id} sessionId={session?.id} />
        <PageHeading>
          <FormattedMessage
            id="EditSession.header"
            defaultMessage="Edit Session"
          />
        </PageHeading>
        <MultiSwrContent
          data={[klass, session]}
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
        >
          {([
            /* wait for class to load, needed for update*/
            _klass,
            session,
          ]) => (
            <SessionForm
              submitMessage={messages.submit}
              initialValues={{
                title: session.title,
                description: session.description,
                taskIds: session.tasks.map((t) => t.id),
                isAnonymous: session.isAnonymous,
              }}
              onSubmit={onSubmit}
            />
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default EditSession;
