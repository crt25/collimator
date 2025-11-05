import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { TableMessages } from "@/i18n/table-messages";
import { useAllTasksLazyTable } from "@/api/collimator/hooks/tasks/useAllTasks";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import SwrContent from "../SwrContent";
import ConfirmationModal from "../modals/ConfirmationModal";
import Button, { ButtonVariant } from "../Button";
import DropdownMenu, { DropdownMenuItem } from "../DropdownMenu";

const TaskTableWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  titleColumn: {
    id: "TaskTable.columns.title",
    defaultMessage: "Title",
  },
  actionsColumn: {
    id: "TaskTable.columns.actions",
    defaultMessage: "Actions",
  },
  deleteConfirmationTitle: {
    id: "TaskTable.deleteConfirmation.title",
    defaultMessage: "Delete Task",
  },
  deleteConfirmationBody: {
    id: "TaskTable.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this task?",
  },
  deleteConfirmationConfirm: {
    id: "TaskTable.deleteConfirmation.confirm",
    defaultMessage: "Delete Task",
  },
});

const taskTitleTemplate = (rowData: ExistingTask) => (
  <span data-testid={`task-${rowData.id}-title`}>{rowData.title}</span>
);

const TaskTable = () => {
  const intl = useIntl();
  const router = useRouter();

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

  const { data, isLoading, error } = useAllTasksLazyTable(lazyState);

  const onPage = (event: DataTablePageEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onSort = (event: DataTableSortEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setLazyState((state) => ({ ...state, ...event }));
  };

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState<number | null>(null);
  const deleteTask = useDeleteTask();

  const actionsTemplate = useCallback(
    (rowData: ExistingTask) => (
      <div data-testid={`task-${rowData.id}-actions`}>
        <DropdownMenu
          trigger={
            <Button
              variant={ButtonVariant.secondary}
              onClick={() => {
                router.push(`/task/${rowData.id}/edit`);
              }}
              data-testid={`task-${rowData.id}-edit-button`}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          }
        >
          <DropdownMenuItem
            onClick={() => {
              setTaskIdToDelete(rowData.id);
              setShowDeleteConfirmationModal(true);
            }}
            data-testid={`task-${rowData.id}-delete-button`}
          >
            {intl.formatMessage(TableMessages.delete)}
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    ),
    [router, intl],
  );

  return (
    <TaskTableWrapper data-testid="task-list">
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
              router.push(`/task/${(e.data as ExistingTask).id}/detail`)
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
              body={taskTitleTemplate}
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
                      onClick={() => router.push("task/create")}
                      data-testid="task-create-button"
                    >
                      <FontAwesomeIcon icon={faAdd} />
                    </Button>
                  }
                />
              }
            />
          </DataTable>
        )}
      </SwrContent>
      <ConfirmationModal
        isShown={showDeleteConfirmationModal}
        setIsShown={setShowDeleteConfirmationModal}
        onConfirm={
          taskIdToDelete ? () => deleteTask(taskIdToDelete) : undefined
        }
        isDangerous
        messages={{
          title: messages.deleteConfirmationTitle,
          body: messages.deleteConfirmationBody,
          confirmButton: messages.deleteConfirmationConfirm,
        }}
      />
    </TaskTableWrapper>
  );
};

export default TaskTable;
