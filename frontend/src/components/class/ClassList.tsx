import { defineMessages, useIntl, FormattedMessage } from "react-intl";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { Icon, HStack, chakra, Text } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { useAllClasses } from "@/api/collimator/hooks/classes/useAllClasses";
import { ExistingClassWithTeacher } from "@/api/collimator/models/classes/existing-class-with-teacher";
import { ColumnType } from "@/types/tanstack-types";
import { isClickOnRow } from "@/utilities/table";
import SwrContent from "../SwrContent";
import { ChakraDataTable, ColumnSize } from "../ChakraDataTable";
import Button from "../Button";
import { EmptyState } from "../EmptyState";

const ClassListWrapper = chakra("div", {
  base: {
    marginTop: "md",
    marginBottom: "md",
  },
});

const messages = defineMessages({
  nameColumn: {
    id: "ClassList.columns.name",
    defaultMessage: "Name",
  },
  createClass: {
    id: "ClassList.createClass",
    defaultMessage: "Create Class",
  },
  teacherColumn: {
    id: "ClassList.columns.teacher",
    defaultMessage: "Teacher",
  },
  deleteConfirmationTitle: {
    id: "ClassList.deleteConfirmation.title",
    defaultMessage: "Delete Class",
  },
  deleteConfirmationBody: {
    id: "ClassList.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this class?",
  },
  deleteConfirmationConfirm: {
    id: "ClassList.deleteConfirmation.confirm",
    defaultMessage: "Delete Class",
  },
  viewDetails: {
    id: "ClassList.viewDetails",
    defaultMessage: "View Class Details",
  },
  emptyStateTitle: {
    id: "ClassList.emptyState.title",
    defaultMessage: "There are no classes yet. Let's create some!",
  },
});

const ClassList = () => {
  const intl = useIntl();
  const router = useRouter();

  const { data, isLoading, error } = useAllClasses();

  const columns: ColumnDef<ExistingClassWithTeacher>[] = [
    {
      accessorKey: "name",
      header: intl.formatMessage(messages.nameColumn),
      enableSorting: true,
      cell: (info) => (
        <Text
          fontWeight="semibold"
          fontSize="lg"
          data-testid={`class-${info.row.original.id}-name`}
          margin={0}
        >
          {info.row.original.name}
        </Text>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "teacher",
      header: intl.formatMessage(messages.teacherColumn),
      cell: (info) => {
        const teacher = info.row.original.teacher;
        return <span>{teacher?.name}</span>;
      },
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      id: "details",
      header: "",
      cell: (info) => (
        <Button
          aria-label={intl.formatMessage(messages.viewDetails)}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/class/${info.row.original.id}/detail`);
          }}
          data-testid={`class-${info.row.original.id}-details-button`}
          variant="detail"
        >
          <Icon>
            <LuChevronRight />
          </Icon>
        </Button>
      ),
      size: ColumnSize.sm,
      meta: {
        columnType: ColumnType.icon,
      },
    },
  ];

  return (
    <ClassListWrapper data-testid="class-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <ChakraDataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            includeSearchBar
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(`/class/${row.id}/detail`);
              }
            }}
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
            }}
            emptyStateElement={
              <EmptyState
                title={<FormattedMessage {...messages.emptyStateTitle} />}
              />
            }
          />
        )}
      </SwrContent>
      <Button
        variant="primary"
        onClick={() => router.push("class/create")}
        data-testid="class-create-button"
        marginTop="md"
      >
        <HStack>
          <Icon>
            <MdAdd />
          </Icon>
          {intl.formatMessage(messages.createClass)}
        </HStack>
      </Button>
    </ClassListWrapper>
  );
};

export default ClassList;
