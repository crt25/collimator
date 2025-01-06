import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useContext, useState } from "react";
import { ButtonGroup, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
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
        <Dropdown as={ButtonGroup}>
          <Button
            variant={ButtonVariant.secondary}
            onClick={(e) => {
              e.stopPropagation();

              router.push(`/class/${classId}/session/${rowData.id}/edit`);
            }}
            data-testid={`session-${rowData.id}-edit-button`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>

          <Dropdown.Toggle
            variant="secondary"
            split
            data-testid={`session-${rowData.id}-actions-dropdown-button`}
          />

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={(e) => {
                e.stopPropagation();

                setSessionIdToDelete(rowData.id);
                setShowDeleteConfirmationModal(true);
              }}
              data-testid={`session-${rowData.id}-delete-button`}
            >
              {intl.formatMessage(TableMessages.delete)}
            </Dropdown.Item>
            {klass &&
              "userId" in authenticationContext &&
              klass.teacher.id === authenticationContext.userId && (
                <Dropdown.Item
                  onClick={async (e) => {
                    e.stopPropagation();

                    const fingerprint =
                      await authenticationContext.keyPair.getPublicKeyFingerprint();

                    navigator.clipboard.writeText(
                      `${window.location.origin}/class/${classId}/session/${rowData.id}/join?key=${fingerprint}`,
                    );
                  }}
                  data-testid={`session-${rowData.id}-delete-button`}
                >
                  {intl.formatMessage(messages.copySessionLink)}
                </Dropdown.Item>
              )}
          </Dropdown.Menu>
        </Dropdown>
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
            onRowClick={(e) =>
              router.push(
                `/class/${classId}/session/${(e.data as ExistingSession).id}/progress`,
              )
            }
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
                <Dropdown as={ButtonGroup}>
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={() =>
                      router.push(`/class/${classId}/session/create`)
                    }
                    data-testid="session-create-button"
                  >
                    <FontAwesomeIcon icon={faAdd} />
                  </Button>
                </Dropdown>
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
