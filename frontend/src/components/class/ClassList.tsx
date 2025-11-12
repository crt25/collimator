import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useRouter } from "next/router";
import { ColumnDef } from "@tanstack/react-table";
import { MdAdd } from "react-icons/md";
import { Icon, HStack, chakra } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { useAllClasses } from "@/api/collimator/hooks/classes/useAllClasses";
import { ExistingClassWithTeacher } from "@/api/collimator/models/classes/existing-class-with-teacher";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";
import { ColumnType } from "@/types/tanstack-types";
import ConfirmationModal from "../modals/ConfirmationModal";
import SwrContent from "../SwrContent";
import { ChakraDataTable } from "../ChakraDataTable";
import Button, { ButtonVariant } from "../Button";

const ClassListWrapper = chakra("div", {
  base: {
    marginTop: "2xl",
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
});

const ClassList = () => {
  const intl = useIntl();
  const router = useRouter();

  const { data, isLoading, error } = useAllClasses();

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const [classIdToDelete] = useState<number | null>(null);
  const deleteClass = useDeleteClass();

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
      id: "details",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <Button
          aria-label={intl.formatMessage(messages.viewDetails)}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/class/${info.row.original.id}/detail`);
          }}
          data-testid={`class-${info.row.original.id}-details-button`}
          variant={ButtonVariant.Detail}
        >
          <Icon>
            <LuChevronRight />
          </Icon>
        </Button>
      ),
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
                pageSize: 4,
              },
            }}
          />
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
        variant={ButtonVariant.Primary}
        onClick={() => router.push("class/create")}
        data-testid="class-create-button"
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
