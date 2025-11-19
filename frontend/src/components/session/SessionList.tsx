import { useCallback, useContext, useState } from "react";
import { defineMessages, useIntl, FormattedMessage } from "react-intl";
import { useRouter } from "next/router";
import { chakra, HStack, Icon, Text, Link } from "@chakra-ui/react";
import { LuChevronRight, LuSend } from "react-icons/lu";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { useAllClassSessions } from "@/api/collimator/hooks/sessions/useAllClassSessions";
import { ExistingSession } from "@/api/collimator/models/sessions/existing-session";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { isClickOnRow } from "@/utilities/table";
import { ColumnType } from "@/types/tanstack-types";
import MultiSwrContent from "../MultiSwrContent";
import Button from "../Button";
import ChakraDataTable from "../ChakraDataTable";
import { ShareModal } from "../form/ShareModal";

const SessionListWrapper = chakra("div", {
  base: {
    marginTop: "md",
    marginBottom: "md",
  },
});

const messages = defineMessages({
  idColumn: {
    id: "SessionList.columns.id",
    defaultMessage: "ID",
  },
  titleColumn: {
    id: "SessionList.columns.title",
    defaultMessage: "Title",
  },
  startedAtColumn: {
    id: "SessionList.columns.startedAt",
    defaultMessage: "Start Date",
  },
  finishedAtColumn: {
    id: "SessionList.columns.finishedAt",
    defaultMessage: "End Date",
  },
  sharingTypeColumn: {
    id: "SessionList.columns.sharingType",
    defaultMessage: "Sharing Type",
  },
  sharingTypeColumnAnonymous: {
    id: "SessionList.columns.sharingTypeAnonymous",
    defaultMessage: "Anonymous",
  },
  sharingTypeColumnPrivate: {
    id: "SessionList.columns.sharingTypePrivate",
    defaultMessage: "Private",
  },
  actionsColumn: {
    id: "SessionList.columns.actions",
    defaultMessage: "Quick Action",
  },
  createSession: {
    id: "SessionList.columns.createSession",
    defaultMessage: "Create Session",
  },
  copySessionLink: {
    id: "SessionList.copySessionLink",
    defaultMessage: "Share",
  },
  canOnlyShareOwnSessions: {
    id: "SessionList.canOnlyShareOwnSessions",
    defaultMessage: "You can only share lessons belonging to your classes.",
  },
  shareModalTitle: {
    id: "SessionList.shareModalTitle",
    defaultMessage: "Invite Student",
  },
  shareModalSubtitle: {
    id: "SessionList.shareModalSubtitle",
    defaultMessage: "Share Link",
  },
  shareModalAnonymousLessonInfo: {
    id: "SessionList.shareModalAnonymousLessonInfo",
    defaultMessage: `This Lesson will be shared anonymously (based on <link>Class settings</link>). Everybody with this link can join the Lesson.`,
  },
  shareModalPrivateLessonInfo: {
    id: "SessionList.shareModalPrivateLessonInfo",
    defaultMessage: `This Lesson will be shared privately (based on <link>Class settings</link>). Only students who are registered in your Class can join the Lesson.`,
  },
  shareModalCopyButton: {
    id: "SessionList.shareModalCopyButton",
    defaultMessage: "Copy Link",
  },
  shareModalCloseButton: {
    id: "SessionList.shareModalCloseButton",
    defaultMessage: "Close",
  },
});

const SessionList = ({ classId }: { classId: number }) => {
  const router = useRouter();
  const intl = useIntl();
  const authenticationContext = useContext(AuthenticationContext);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<ExistingSession | null>(null);
  const [sessionLink, setSessionLink] = useState("");

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const { data, isLoading, error } = useAllClassSessions(classId);

  const handleShareClick = useCallback(
    (session: ExistingSession, link: string) => {
      setSessionLink(link);
      setSelectedSession(session);
      setIsShareModalOpen(true);
    },
    [],
  );

  const startedAtTemplate = useCallback(
    (rowData: ExistingSession) =>
      // TODO: Change to startedAt once it's available
      rowData.createdAt && (
        <time>
          {intl.formatDate(rowData.createdAt)}{" "}
          {intl.formatTime(rowData.createdAt)}
        </time>
      ),
    [intl],
  );

  const actionsTemplate = useCallback(
    (rowData: ExistingSession) => {
      if (!klass) {
        return null;
      }

      const canGetSessionLink =
        "userId" in authenticationContext &&
        klass.teacher.id === authenticationContext.userId;

      return canGetSessionLink ? (
        <Button
          onClick={async () => {
            const fingerprint =
              await authenticationContext.keyPair.getPublicKeyFingerprint();

            const link = `${window.location.origin}/class/${classId}/session/${rowData.id}/join?key=${fingerprint}`;
            handleShareClick(rowData, link);
          }}
          data-test-id={`session-${rowData.id}-copy-session-link-button`}
        >
          <Icon>
            <LuSend />
          </Icon>{" "}
          {intl.formatMessage(messages.copySessionLink)}
        </Button>
      ) : (
        <Button
          disabled
          title={intl.formatMessage(messages.canOnlyShareOwnSessions)}
        >
          <Icon>
            <LuSend />
          </Icon>{" "}
          {intl.formatMessage(messages.copySessionLink)}
        </Button>
      );
    },
    [intl, authenticationContext, klass, handleShareClick, classId],
  );

  const sharingTypeTemplate = useCallback(
    (rowData: ExistingSession) =>
      rowData.isAnonymous
        ? intl.formatMessage(messages.sharingTypeColumnAnonymous)
        : intl.formatMessage(messages.sharingTypeColumnPrivate),
    [intl],
  );

  const columns: ColumnDef<ExistingSession>[] = [
    {
      accessorKey: "id",
      header: intl.formatMessage(messages.idColumn),
      enableSorting: false,
      size: 32,
    },
    {
      accessorKey: "title",
      header: intl.formatMessage(messages.titleColumn),
      cell: (info) => (
        <Text
          fontWeight="semibold"
          fontSize="lg"
          data-testid={`session-${info.row.original.id}-title`}
          margin={0}
        >
          {info.row.original.title}
        </Text>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "startedAt",
      header: intl.formatMessage(messages.startedAtColumn),
      enableSorting: false,
      cell: (info) => startedAtTemplate(info.row.original),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "isAnonymous",
      header: intl.formatMessage(messages.sharingTypeColumn),
      enableSorting: false,
      cell: (info) => sharingTypeTemplate(info.row.original),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      id: "actions",
      header: intl.formatMessage(messages.actionsColumn),
      enableSorting: false,
      cell: (info) => actionsTemplate(info.row.original),
      meta: {
        columnType: ColumnType.icon,
      },
    },
    {
      id: "details",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <Button
          aria-label={intl.formatMessage(messages.actionsColumn)}
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/class/${classId}/session/${info.row.original.id}/progress`,
            );
          }}
          data-testid={`session-${info.row.original.id}-details-button`}
          variant="detail"
        >
          <Icon>
            <LuChevronRight />
          </Icon>
        </Button>
      ),
      meta: {
        columnType: ColumnType.icon,
      },
    },
  ];

  return (
    <SessionListWrapper data-testid="session-list">
      <MultiSwrContent
        data={[data, klass]}
        isLoading={[isLoading, isLoadingKlass]}
        errors={[error, klassError]}
      >
        {([data]) => (
          <ChakraDataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(`/class/${classId}/session/${row.id}/progress`);
              }
            }}
            features={{
              sorting: true,
              columnFiltering: {
                columns: [
                  {
                    accessorKey: "title",
                    label: intl.formatMessage(messages.titleColumn),
                  },
                ],
              },
              pagination: {
                pageSize: 10,
              },
            }}
          />
        )}
      </MultiSwrContent>
      <Button
        variant="primary"
        onClick={() => router.push(`/class/${classId}/session/create`)}
        data-testid="class-create-button"
        marginTop="md"
      >
        <HStack>
          <Icon>
            <MdAdd />
          </Icon>
          {intl.formatMessage(messages.createSession)}
        </HStack>
      </Button>

      <ShareModal
        title={<FormattedMessage {...messages.shareModalTitle} />}
        subtitle={<FormattedMessage {...messages.shareModalSubtitle} />}
        description={
          selectedSession?.isAnonymous ? (
            <FormattedMessage
              {...messages.shareModalAnonymousLessonInfo}
              values={{
                link: (chunks) => (
                  <Link
                    textDecoration="underline"
                    href={`/class/${classId}/session/${selectedSession?.id}/detail`}
                  >
                    {chunks}
                  </Link>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              {...messages.shareModalPrivateLessonInfo}
              values={{
                link: (chunks) => (
                  <Link
                    textDecoration="underline"
                    href={`/class/${classId}/session/${selectedSession?.id}/detail`}
                  >
                    {chunks}
                  </Link>
                ),
              }}
            />
          )
        }
        confirmButtonText={
          <FormattedMessage {...messages.shareModalCopyButton} />
        }
        cancelButtonText={
          <FormattedMessage {...messages.shareModalCloseButton} />
        }
        open={isShareModalOpen}
        shareLink={sessionLink}
        onOpenChange={(details) => setIsShareModalOpen(details.open)}
      />
    </SessionListWrapper>
  );
};

export default SessionList;
