import { useRouter } from "next/router";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useState, useCallback, useContext } from "react";
import { Container } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import ProgressList from "@/components/dashboard/ProgressList";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import PageHeading from "@/components/PageHeading";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import SessionActions from "@/components/session/SessionActions";
import { ShareModal } from "@/components/form/ShareModal";
import { SessionShareMessages } from "@/i18n/session-share-messages";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import Button from "@/components/Button";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "SessionProgress.title",
    defaultMessage: "Progress - {title}",
  },
  shareLesson: {
    id: "SessionProgress.shareLesson",
    defaultMessage: "Invite Student",
  },
  canOnlyShareOwnSessions: {
    id: "SessionProgress.canOnlyShareOwnSessions",
    defaultMessage: "You can only share lessons belonging to your classes.",
  },
});

const SessionProgress = () => {
  const router = useRouter();
  const intl = useIntl();
  const { classId, sessionId } = router.query as {
    classId: string;
    sessionId: string;
  };

  const authenticationContext = useContext(AuthenticationContext);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sessionLink, setSessionLink] = useState("");

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

  const canGetSessionLink =
    klass &&
    "userId" in authenticationContext &&
    klass.teacher.id === authenticationContext.userId;

  const handleShareClick = useCallback(async () => {
    if (session && canGetSessionLink) {
      const fingerprint =
        await authenticationContext.keyPair.getPublicKeyFingerprint();

      const link = `${window.location.origin}/class/${classId}/session/${session.id}/join?key=${fingerprint}`;
      setSessionLink(link);
      setIsShareModalOpen(true);
    }
  }, [session, authenticationContext, classId, canGetSessionLink]);

  const shareMessage = session?.isAnonymous
    ? SessionShareMessages.shareModalAnonymousLessonInfo
    : SessionShareMessages.shareModalPrivateLessonInfo;

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          title: session?.title ?? "",
        }}
      >
        <AnonymizationToggle />
      </Header>
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation classId={klass?.id} breadcrumb session={session} />
        </Breadcrumbs>
        <MultiSwrContent
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
          data={[klass, session]}
        >
          {([klass, session]) => (
            <>
              <PageHeading
                variant="title"
                actions={<SessionActions klass={klass} session={session} />}
              >
                {session.title}
              </PageHeading>
              <SessionNavigation classId={klass.id} sessionId={session.id} />
              <ProgressList classId={klass.id} sessionId={session.id} />
              {canGetSessionLink ? (
                <Button onClick={handleShareClick}>
                  {intl.formatMessage(messages.shareLesson)}
                </Button>
              ) : (
                <Button
                  disabled
                  title={intl.formatMessage(messages.canOnlyShareOwnSessions)}
                >
                  {intl.formatMessage(messages.shareLesson)}
                </Button>
              )}
            </>
          )}
        </MultiSwrContent>
      </Container>

      <ShareModal
        title={
          <FormattedMessage
            id={SessionShareMessages.shareModalTitle.id}
            defaultMessage={SessionShareMessages.shareModalTitle.defaultMessage}
          />
        }
        subtitle={
          <FormattedMessage
            id={SessionShareMessages.shareModalSubtitle.id}
            defaultMessage={
              SessionShareMessages.shareModalSubtitle.defaultMessage
            }
          />
        }
        description={
          <FormattedMessage
            id={shareMessage.id}
            defaultMessage={shareMessage.defaultMessage}
          />
        }
        open={isShareModalOpen}
        shareLink={sessionLink}
        onOpenChange={(details) => setIsShareModalOpen(details.open)}
      />
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default SessionProgress;
