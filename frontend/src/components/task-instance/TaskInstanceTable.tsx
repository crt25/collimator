import { defineMessages, useIntl } from "react-intl";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { Icon, HStack, Text, chakra } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import SwrContent from "../SwrContent";
import { ChakraDataTable } from "../ChakraDataTable";
import Button from "../Button";
import { ColumnType } from "@/types/tanstack-types";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { capitalizeString } from "@/utilities/strings";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useTaskInstances } from "@/api/collimator/hooks/tasks/useTaskInstances";
import { isClickOnRow } from "@/utilities/table";

const TaskInstanceTableWrapper = chakra("div", {
  base: {
    marginTop: "md",
    marginBottom: "md",
  },
});

const messages = defineMessages({
  idColumn: {
    id: "TaskInstanceTable.columns.id",
    defaultMessage: "ID",
  },
  nameColumn: {
    id: "TaskInstanceTable.columns.name",
    defaultMessage: "Name",
  },
  taskTypeColumn: {
    id: "TaskInstanceTable.columns.taskType",
    defaultMessage: "Task Type",
  },
  deleteConfirmationTitle: {
    id: "TaskInstanceTable.deleteConfirmation.title",
    defaultMessage: "Delete Task",
  },
  deleteConfirmationBody: {
    id: "TaskInstanceTable.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this task?",
  },
  deleteConfirmationConfirm: {
    id: "TaskInstanceTable.deleteConfirmation.confirm",
    defaultMessage: "Delete Task",
  },
  viewDetails: {
    id: "TaskInstanceTable.viewDetails",
    defaultMessage: "View Task Details",
  },
  deleteTask: {
    id: "TaskInstanceTable.deleteTask",
    defaultMessage: "Delete Task",
  },
  createTask: {
    id: "TaskInstanceTable.createTask",
    defaultMessage: "Create Task",
  },
});

const TaskInstanceTable = ({
  klass,
  session,
}: {
  klass: ExistingClassExtended;
  session: ExistingSessionExtended;
}) => {
  const intl = useIntl();
  const router = useRouter();

  const { data, isLoading, error } = useTaskInstances(session);

  const columns: ColumnDef<ExistingTask>[] = [
    {
      accessorKey: "id",
      header: intl.formatMessage(messages.idColumn),
      enableSorting: false,
      size: 32,
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
      accessorKey: "title",
      header: intl.formatMessage(messages.nameColumn),
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
    /*
          This will later only be a task instance and should only delete the instance, not the task itself.
    {
      id: "actions",
      header: "Quick Actions",
      enableSorting: false,
      cell: (info) => (
        <div data-testid={`task-${info.row.original.id}-actions`}>
          {

          <Button
            aria-label={intl.formatMessage(messages.deleteTask)}
            onClick={(e) => {
              e.stopPropagation();
              setTaskIdToDelete(info.row.original.id);
              setShowDeleteConfirmationModal(true);
            }}
            data-testid={`task-${info.row.original.id}-delete-button`}
            variant="detail"
          >
            <FaRegTrashAlt />
          </Button>}
        </div>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
     */
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
              router.push(
                `/class/${klass.id}/session/${session.id}/task/${info.row.original.id}/detail`,
              );
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
      meta: {
        columnType: ColumnType.text,
      },
    },
  ];

  return (
    <TaskInstanceTableWrapper data-testid="session-task-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <ChakraDataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(
                  `/class/${klass.id}/session/${session.id}/task/${row.id}/detail`,
                );
              }
            }}
            features={{
              sorting: true,
              columnFiltering: {
                columns: [
                  {
                    accessorKey: "title",
                    label: intl.formatMessage(messages.nameColumn),
                  },
                ],
              },
              pagination: {
                pageSize: 4,
              },
            }}
          />
        )}
      </SwrContent>
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
    </TaskInstanceTableWrapper>
  );
};

export default TaskInstanceTable;
