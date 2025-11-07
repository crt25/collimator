import {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Icon } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";
import DataTable, { LazyTableState } from "@/components/DataTable";
import { useAllClassesLazyTable } from "@/api/collimator/hooks/classes/useAllClasses";
import DropdownMenu from "../DropdownMenu";
import { ColumnDef } from "@tanstack/react-table";
import { FaCircle } from "react-icons/fa";
import ConfirmationModal from "../modals/ConfirmationModal";
import SwrContent from "../SwrContent";
import Button, { ButtonVariant } from "../Button";
import { getClassStatusMessage } from "@/i18n/class-status-messages";
import { ExistingClassWithTeacher } from "@/api/collimator/models/classes/existing-class-with-teacher";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";
import { ColumnType } from "@/types/tanstack-types";

const ClassListWrapper = styled.div`
  margin: 1rem 0;
`;

const StatusWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const messages = defineMessages({
  nameColumn: {
    id: "ClassList.columns.name",
    defaultMessage: "Name",
  },
  degreeColumn: {
    id: "ClassList.columns.degree",
    defaultMessage: "Degree",
  },
  createClass: {
    id: "ClassList.createClass",
    defaultMessage: "Create Class",
  },
  schoolYearColumn: {
    id: "ClassList.columns.schoolYear",
    defaultMessage: "School Year",
  },
  teacherColumn: {
    id: "ClassList.columns.teacher",
    defaultMessage: "Teacher",
  },
  statusColumn: {
    id: "ClassList.columns.status",
    defaultMessage: "Status",
  },
  actionsColumn: {
    id: "ClassList.columns.actions",
    defaultMessage: "Actions",
  },
  activeStatus: {
    id: "ClassList.status.active",
    defaultMessage: "Active",
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
  current: {
    id: "ClassStatus.current",
    defaultMessage: "Current",
  },
  past: {
    id: "ClassStatus.past",
    defaultMessage: "Past",
  },
});

const ClassList = () => {
  const intl = useIntl();
  const router = useRouter();

  const { data, isLoading, error } = useAllClasses();

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const [classIdToDelete] = useState<number | null>(null);
  const deleteClass = useDeleteClass();

  const dataWithMockFields = data?.map((classItem) => ({
    ...classItem,
    degree: classItem.degree || "12th grade",
    schoolYear: classItem.schoolYear || "2024-2025",
    status: classItem.status || "current",
  }));

  const columns: ColumnDef<ExistingClassWithTeacher>[] = [
    {
      accessorKey: "name",
      header: intl.formatMessage(messages.nameColumn),
      cell: (info) => (
        <span data-testid={`class-${info.row.original.id}-name`}>
          {info.row.original.name}
        </span>
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "degree",
      header: intl.formatMessage(messages.degreeColumn),
      enableSorting: false,
      cell: (info) => {
        const degree = info.row.original.degree;
        return <span>{degree}</span>;
      },
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "schoolYear",
      header: intl.formatMessage(messages.schoolYearColumn),
      enableSorting: false,
      cell: (info) => {
        const schoolYear = info.row.original.schoolYear;
        return <span>{schoolYear}</span>;
      },
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "teacher",
      header: intl.formatMessage(messages.teacherColumn),
      enableSorting: false,
      cell: (info) => {
        const teacher = info.row.original.teacher;
        return <span>{teacher?.name || "Mr. Bumbacher"}</span>;
      },
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "status",
      header: intl.formatMessage(messages.statusColumn),
      enableSorting: false,
      cell: (info) => {
        const status = info.row.original.status;
        const isActive = status === "current";
        return (
          <StatusWrapper>
            <FaCircle color={isActive ? "#22c55e" : "#6b7280"} size={10} />
            <span>{intl.formatMessage(getClassStatusMessage(status))}</span>
          </StatusWrapper>
        );
      },
      meta: {
        columnType: ColumnType.text,
      },
    },
  ];

  return (
    <ClassListWrapper data-testid="class-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <>
            <ChakraDataTable
              data={dataWithMockFields || data || []}
              columns={columns}
              isLoading={isLoading}
              onRowClick={(row) => router.push(`/class/${row.id}/detail`)}
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
            />
          </>
        )}
      </SwrContent>
      <ConfirmationModal
        isShown={showDeleteConfirmationModal}
        setIsShown={setShowDeleteConfirmationModal}
        onConfirm={
          classIdToDelete ? () => deleteClass(classIdToDelete) : undefined
        }
        isDangerous
        messages={{
          title: messages.deleteConfirmationTitle,
          body: messages.deleteConfirmationBody,
          confirmButton: messages.deleteConfirmationConfirm,
        }}
      />
      <Button
        variant={ButtonVariant.secondary}
        onClick={() => router.push("class/create")}
        data-testid="class-create-button"
      >
        {intl.formatMessage(messages.createClass)}
        <FontAwesomeIcon icon={faAdd} />
      </Button>
    </ClassListWrapper>
  );
};

export default ClassList;
