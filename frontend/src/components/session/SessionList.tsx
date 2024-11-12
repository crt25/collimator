import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useState } from "react";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import Tag from "@/components/Tag";
import Tags from "@/components/Tags";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { TableMessages } from "@/i18n/table-messages";
import { useRouter } from "next/router";
import { useAllClassSessionsLazyTable } from "@/api/collimator/hooks/sessions/useAllClassSessions";
import SwrContent from "../SwrContent";
import { ExistingSession } from "@/api/collimator/models/sessions/existing-session";
import { useDeleteClassSession } from "@/api/collimator/hooks/sessions/useDeleteClassSession";
import ConfirmationModal from "../modals/ConfirmationModal";

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
});

const SessionList = ({ classId }: { classId: number }) => {
  const router = useRouter();
  const intl = useIntl();

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
            variant="secondary"
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
              data-testid={`task-${rowData.id}-delete-button`}
            >
              {intl.formatMessage(TableMessages.delete)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    ),
    [classId, intl, router],
  );

  return (
    <SessionListWrapper data-testid="session-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
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
                    variant="secondary"
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
      </SwrContent>
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
