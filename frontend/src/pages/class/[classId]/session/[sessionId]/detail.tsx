import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { useCallback } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/header/Header";
import PageHeading from "@/components/PageHeading";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useUpdateClassSession } from "@/api/collimator/hooks/sessions/useUpdateClassSession";
import SessionNavigation from "@/components/session/SessionNavigation";
import MultiSwrContent from "@/components/MultiSwrContent";
import SessionForm, {
  SessionFormValues,
  SharingType,
} from "@/components/session/SessionForm";
import { toaster } from "@/components/Toaster";
import SessionActions from "@/components/session/SessionActions";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "SessionDetail.title",
    defaultMessage: "Lesson - {title}",
  },
  submit: {
    id: "SessionDetail.submit",
    defaultMessage: "Save Lesson",
  },
  successMessage: {
    id: "SessionDetail.successMessage",
    defaultMessage: "Successfully saved changes",
  },
  errorMessage: {
    id: "SessionDetail.errorMessage",
    defaultMessage:
      "There was an error saving the changes. Please try to save again!",
  },
});

const SessionDetail = () => {
  const intl = useIntl();
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
        try {
          await updateSession(klass.id, session.id, {
            title: formValues.title,
            description: formValues.description,
            taskIds: formValues.taskIds,
            isAnonymous: formValues.sharingType === SharingType.anonymous,
          });
          toaster.success({
            title: intl.formatMessage(messages.successMessage),
          });
        } catch {
          toaster.error({
            title: intl.formatMessage(messages.errorMessage),
          });
        }
      }
    },
    [intl, klass, session, updateSession],
  );

  return (
    <MaxScreenHeight>
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
            <>
              <PageHeading
                actions={<SessionActions klass={_klass} session={session} />}
              >
                {session.title}
              </PageHeading>
              <SessionNavigation classId={klass?.id} sessionId={session?.id} />
              <SessionForm
                submitMessage={messages.submit}
                initialValues={{
                  title: session.title,
                  description: session.description,
                  taskIds: session.tasks.map((t) => t.id),
                  sharingType: session.isAnonymous
                    ? SharingType.anonymous
                    : SharingType.private,
                }}
                onSubmit={onSubmit}
                classId={_klass.id}
              />
            </>
          )}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default SessionDetail;
