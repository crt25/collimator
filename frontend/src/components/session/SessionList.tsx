import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useContext, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Icon, IconButton } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { TableMessages } from "@/i18n/table-messages";
import Tags from "@/components/Tags";
import Tag from "@/components/Tag";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { useAllClassSessionsLazyTable } from "@/api/collimator/hooks/sessions/useAllClassSessions";
import { ExistingSession } from "@/api/collimator/models/sessions/existing-session";
import { useDeleteClassSession } from "@/api/collimator/hooks/sessions/useDeleteClassSession";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import ConfirmationModal from "../modals/ConfirmationModal";
import MultiSwrContent from "../MultiSwrContent";
import Button, { ButtonVariant } from "../Button";
import DropdownMenu from "../DropdownMenu";
import { ButtonGroup } from "../ButtonGroup";

const SessionListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  titleColumn: {
    id: "SessionList.columns.title",
    defaultMessage: "Title",
  },
  tagsColumn: {
    id: "SessionList.columns.tags",
    defaultMessage: "Tags",
  },
  startedAtColumn: {
    id: "SessionList.columns.startedAt",
    defaultMessage: "Started at",
  },
  finishedAtColumn: {
    id: "SessionList.columns.finishedAt",
    defaultMessage: "Finished at",
  },
  actionsColumn: {
    id: "SessionList.columns.actions",
    defaultMessage: "Actions",
  },
  deleteConfirmationTitle: {
    id: "SessionList.deleteConfirmation.title",
    defaultMessage: "Delete Session",
  },
  deleteConfirmationBody: {
    id: "SessionList.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this session?",
  },
  deleteConfirmationConfirm: {
    id: "SessionList.deleteConfirmation.confirm",
    defaultMessage: "Delete Session",
  },
  copySessionLink: {
    id: "SessionList.copySessionLink",
    defaultMessage: "Copy Session Link",
  },
});

const sessionTitleTemplate = (rowData: ExistingSession) => (
  <span data-testid={`session-${rowData.id}-title`}>{rowData.title}</span>
);

const SessionList = ({ classId }: { classId: number }) => {
  const router = useRouter();
  const intl = useIntl();
  const authenticationContext = useContext(AuthenticationContext);

  const [lazyState, setLazyState] = useState<LazyTableState>({
    first: 0,
    rows: 10,
    page: 1,
    sortField: undefined,
    sortOrder: undefined,
    filters: {
      name: {
        value: "",
        matchMode: "contains",
      },
    },
  });

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const { data, isLoading, error } = useAllClassSessionsLazyTable(
    classId,
    lazyState,
  );

  const onPage = (event: DataTablePageEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onSort = (event: DataTableSortEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const tagsTemplate = useCallback(
    (_rowData: ExistingSession) => (
      // TODO: Use tags once they're available
      <Tags>
        {[].map((tag, index) => (
          <Tag key={index} id={tag}>
            {tag}
          </Tag>
        ))}
      </Tags>
    ),
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

  const finishedAtTemplate = useCallback(
    (rowData: ExistingSession) =>
      // TODO: Change to finishedAt once it's available
      rowData.createdAt && (
        <time>
          {intl.formatDate(rowData.createdAt)}{" "}
          {intl.formatTime(rowData.createdAt)}
        </time>
      ),
    [intl],
  );

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = useState<number | null>(
    null,
  );
  const deleteSession = useDeleteClassSession();

  const actionsTemplate = useCallback(
    (rowData: ExistingSession) => (
      <div>
        <ButtonGroup>
          <Button
            variant={ButtonVariant.primary}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/class/${classId}/session/${rowData.id}/edit`);
            }}
            data-testid={`session-${rowData.id}-edit-button`}
          >
            <Icon>
              <FaEdit />
            </Icon>
          </Button>
          <DropdownMenu
            testId={`session-${rowData.id}-actions-dropdown-button`}
            trigger={
              <IconButton aria-label="More actions">
                <LuChevronDown />
              </IconButton>
            }
          >
            <DropdownMenu.Item
              onClick={() => {
                setSessionIdToDelete(rowData.id);
                setShowDeleteConfirmationModal(true);
              }}
              testId={`session-${rowData.id}-delete-button`}
            >
              {intl.formatMessage(TableMessages.delete)}
            </DropdownMenu.Item>
            {klass &&
              "userId" in authenticationContext &&
              klass.teacher.id === authenticationContext.userId && (
                <DropdownMenu.Item
                  onClick={async () => {
                    const fingerprint =
                      await authenticationContext.keyPair.getPublicKeyFingerprint();

                    navigator.clipboard.writeText(
                      `${window.location.origin}/class/${classId}/session/${rowData.id}/join?key=${fingerprint}`,
                    );
                  }}
                  testId={`session-${rowData.id}-copy-session-link-button`}
                >
                  {intl.formatMessage(messages.copySessionLink)}
                </DropdownMenu.Item>
              )}
          </DropdownMenu>
        </ButtonGroup>
      </div>
    ),
    [classId, intl, router, authenticationContext, klass],
  );

  return (
    <SessionListWrapper data-testid="session-list">
      <MultiSwrContent
        data={[data, klass]}
        isLoading={[isLoading, isLoadingKlass]}
        errors={[error, klassError]}
      >
        {([data]) => (
          <DataTable
            value={data.items}
            lazy
            filterDisplay="row"
            dataKey="id"
            paginator
            first={lazyState.first}
            rows={10}
            totalRecords={data.totalCount}
            onPage={onPage}
            onSort={onSort}
            sortField={lazyState.sortField}
            sortOrder={lazyState.sortOrder}
            onFilter={onFilter}
            filters={lazyState.filters}
            loading={isLoading}
            onRowClick={(e) => {
              if (
                e.originalEvent.target instanceof Element &&
                e.originalEvent.target.tagName === "TD"
              )
                router.push(
                  `/class/${classId}/session/${(e.data as ExistingSession).id}/progress`,
                );
            }}
          >
            <Column
              field="title"
              header={intl.formatMessage(messages.titleColumn)}
              sortable
              filter
              filterPlaceholder={intl.formatMessage(
                TableMessages.searchFilterPlaceholder,
              )}
              filterMatchMode="contains"
              showFilterMenu={false}
              body={sessionTitleTemplate}
            />
            <Column
              header={intl.formatMessage(messages.tagsColumn)}
              filter
              filterPlaceholder={intl.formatMessage(
                TableMessages.searchFilterPlaceholder,
              )}
              filterMatchMode="contains"
              showFilterMenu={false}
              body={tagsTemplate}
            />
            <Column
              field="startedAt"
              header={intl.formatMessage(messages.startedAtColumn)}
              sortable
              body={startedAtTemplate}
            />
            <Column
              field="finishedAt"
              header={intl.formatMessage(messages.finishedAtColumn)}
              sortable
              body={finishedAtTemplate}
            />
            <Column
              header={intl.formatMessage(messages.actionsColumn)}
              body={actionsTemplate}
              filter
              filterElement={
                <DropdownMenu
                  trigger={
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() =>
                        router.push(`/class/${classId}/session/create`)
                      }
                      data-testid="session-create-button"
                    >
                      <Icon>
                        <MdAdd />
                      </Icon>
                    </Button>
                  }
                />
              }
            />
          </DataTable>
        )}
      </MultiSwrContent>
      <ConfirmationModal
        isShown={showDeleteConfirmationModal}
        setIsShown={setShowDeleteConfirmationModal}
        onConfirm={
          sessionIdToDelete
            ? () => deleteSession(classId, sessionIdToDelete)
            : undefined
        }
        isDangerous
        messages={{
          title: messages.deleteConfirmationTitle,
          body: messages.deleteConfirmationBody,
          confirmButton: messages.deleteConfirmationConfirm,
        }}
      />
    </SessionListWrapper>
  );
};

export default SessionList;
