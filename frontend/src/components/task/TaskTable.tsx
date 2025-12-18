import { useState } from "react";
import { defineMessages, useIntl, FormattedMessage } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { Icon, HStack, Text } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { ColumnType } from "@/types/tanstack-types";
import { useAllTasks } from "@/api/collimator/hooks/tasks/useAllTasks";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { capitalizeString } from "@/utilities/strings";
import { isClickOnRow } from "@/utilities/table";
import SwrContent from "../SwrContent";
import ConfirmationModal from "../modals/ConfirmationModal";
import { ChakraDataTable } from "../ChakraDataTable";
import Button from "../Button";
import { EmptyState } from "../EmptyState";

const TaskTableWrapper = styled.div`
  margin: 1rem 0;
`;

const messages = defineMessages({
  idColumn: {
    id: "TaskTable.columns.id",
    defaultMessage: "ID",
  },
  titleColumn: {
    id: "TaskTable.columns.title",
    defaultMessage: "Title",
  },
  taskTypeColumn: {
    id: "TaskTable.columns.taskType",
    defaultMessage: "Task Type",
  },
  actionsColumn: {
    id: "TaskTable.columns.actionsColumn",
    defaultMessage: "Quick Actions",
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
  viewDetails: {
    id: "TaskTable.viewDetails",
    defaultMessage: "View Task Details",
  },
  deleteTask: {
    id: "TaskTable.deleteTask",
    defaultMessage: "Delete Task",
  },
  createTask: {
    id: "TaskTable.createTask",
    defaultMessage: "Create Task",
  },
  emptyStateTitle: {
    id: "TaskTable.emptyState.title",
    defaultMessage: "There are no tasks yet. Let's create some!",
  },
});

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
      size: 32,
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "title",
      header: intl.formatMessage(messages.titleColumn),
      cell: (info) => (
        <Text
          fontWeight="semibold"
          fontSize="lg"
          data-testid={`task-${info.row.original.id}-title`}
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
      header: intl.formatMessage(messages.actionsColumn),
      enableSorting: false,
      cell: (info) => (
        <div data-testid={`task-${info.row.original.id}-actions`}>
          <Button
            aria-label={intl.formatMessage(messages.deleteTask)}
            onClick={(e) => {
              e.stopPropagation();
              setTaskIdToDelete(info.row.original.id);
              setShowDeleteConfirmationModal(true);
            }}
            data-testid={`task-${info.row.original.id}-delete-button`}
            variant="ghost"
          >
            <FaRegTrashAlt />
          </Button>
        </div>
      ),
      size: 64,
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
          <Button
            aria-label={intl.formatMessage(messages.viewDetails)}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/task/${info.row.original.id}/detail`);
            }}
            data-testid={`task-${info.row.original.id}-details-button`}
            variant="detail"
          >
            <Icon>
              <LuChevronRight />
            </Icon>
          </Button>
        </div>
      ),
      size: 32,
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
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(`/task/${row.id}/detail`);
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
            }}
            emptyStateElement={
              <EmptyState
                title={<FormattedMessage {...messages.emptyStateTitle} />}
              />
            }
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
      <Button
        variant="primary"
        onClick={() => router.push("task/create")}
        data-testid="task-create-button"
        marginTop="md"
      >
        <HStack>
          <Icon>
            <MdAdd />
          </Icon>
          {intl.formatMessage(messages.createTask)}
        </HStack>
      </Button>
    </TaskTableWrapper>
  );
};

export default TaskTable;
