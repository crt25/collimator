import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { Icon, HStack } from "@chakra-ui/react";
import { useAllClasses } from "@/api/collimator/hooks/classes/useAllClasses";
import { ExistingClassWithTeacher } from "@/api/collimator/models/classes/existing-class-with-teacher";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";
import { ColumnType } from "@/types/tanstack-types";
import ConfirmationModal from "../modals/ConfirmationModal";
import SwrContent from "../SwrContent";
import { ChakraDataTable } from "../ChakraDataTable";
import Button, { ButtonVariant } from "../Button";

const ClassListWrapper = styled.div`
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
    degree: "12th grade",
    schoolYear: "2024-2025",
    status: "current",
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
      cell: () => <span>12th grade</span>,
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "schoolYear",
      header: intl.formatMessage(messages.schoolYearColumn),
      enableSorting: false,
      cell: () => <span>2024-2025</span>,
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
        return <span>{teacher?.name}</span>;
      },
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "status",
      header: intl.formatMessage(messages.statusColumn),
      enableSorting: false,
      cell: () => {
        const status = "current";
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
      <StyledButton
        variant={ButtonVariant.primary}
        onClick={() => router.push("class/create")}
        data-testid="class-create-button"
      >
        <Stack>
          <Icon>
            <MdAdd />
          </Icon>
          {intl.formatMessage(messages.createClass)}
        </Stack>
      </StyledButton>
    </ClassListWrapper>
  );
};

export default ClassList;
