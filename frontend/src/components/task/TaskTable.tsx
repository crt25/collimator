import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { Icon, HStack } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { ColumnType } from "@/types/tanstack-types";
import { useAllTasks } from "@/api/collimator/hooks/tasks/useAllTasks";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { capitalizeString } from "@/utilities/strings";
import SwrContent from "../SwrContent";
import ConfirmationModal from "../modals/ConfirmationModal";
import { ChakraDataTable } from "../ChakraDataTable";
import Button, { ButtonVariant } from "../Button";

const TaskTableWrapper = styled.div`
  margin: 1rem 0;
`;

const StyledButton = styled(Button)`
  && {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
`;

const Stack = styled(HStack)`
  && {
    gap: 1rem;
  }
`;

const StyledIconButton = styled(Icon)`
  background-color: var(--icon-button-background-color);
  cursor: pointer;
  transition: color 0.2s ease;

  && {
    &:hover {
      color: var(--icon-button-hover-color);
    }
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

  const { data, isLoading, error } = useAllTasks();
  const deleteTask = useDeleteTask();

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState<number | null>(null);

  const columns: ColumnDef<ExistingTask>[] = [
    {
      accessorKey: "id",
      header: intl.formatMessage(messages.idColumn),
      enableSorting: false,
      cell: (info) => (
        <span data-testid={`task-${info.row.original.id}-id`}>
          {info.row.original.id}
        </span>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "name",
      header: intl.formatMessage(messages.nameColumn),
      cell: (info) => (
        <span data-testid={`task-${info.row.original.id}-name`}>
          {info.row.original.title}
        </span>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "taskType",
      header: intl.formatMessage(messages.taskTypeColumn),
      enableSorting: false,
      cell: (info) => (
        <span data-testid={`task-${info.row.original.id}-taskType`}>
          {capitalizeString(info.row.original.type)}
        </span>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      id: "actions",
      header: "Quick Actions",
      enableSorting: false,
      cell: (info) => (
        <div data-testid={`task-${info.row.original.id}-actions`}>
          <StyledIconButton
            aria-label="Delete task"
            onClick={(e) => {
              e.stopPropagation();
              setTaskIdToDelete(info.row.original.id);
              setShowDeleteConfirmationModal(true);
            }}
            data-testid={`task-${info.row.original.id}-delete-button`}
          >
            <FaRegTrashAlt />
          </StyledIconButton>
        </div>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      id: "details",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <div data-testid={`task-${info.row.original.id}-actions`}>
          <StyledIconButton
            aria-label="View task details"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/task/${info.row.original.id}/detail`);
            }}
            data-testid={`task-${info.row.original.id}-details-button`}
          >
            <LuChevronRight />
          </StyledIconButton>
        </div>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
  ];

  return (
    <TaskTableWrapper data-testid="task-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <ChakraDataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            // onRowClick={(row) => router.push(`/task/${row.id}/detail`)}
            features={{
              sorting: true,
              columnFiltering: {
                columns: [
                  {
                    accessorKey: "name",
                    label: intl.formatMessage(messages.nameColumn),
                  },
                ],
              },
              pagination: {
                pageSize: 10,
              },
            }}
            includeSearchBar={false}
          />
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
      <StyledButton
        variant={ButtonVariant.Primary}
        onClick={() => router.push("task/create")}
        data-testid="task-create-button"
      >
        <Stack>
          <Icon>
            <MdAdd />
          </Icon>
          Create Task
        </Stack>
      </StyledButton>
    </TaskTableWrapper>
  );
};

export default TaskTable;
