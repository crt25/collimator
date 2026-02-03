import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useRouter } from "next/router";
import { chakra, HStack, Icon, Text } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import { ColumnDef } from "@tanstack/react-table";
import { getUserTypeMessage } from "@/i18n/user-type-messages";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";
import { useAllUsersLazyTable } from "@/api/collimator/hooks/users/useAllUsers";
import { isClickOnRow } from "@/utilities/table";
import { ColumnType } from "@/types/tanstack-types";
import SwrContent from "../SwrContent";
import Button from "../Button";
import ChakraDataTable, { ColumnSize } from "../ChakraDataTable";

const UserListWrapper = chakra("div", {
  base: {
    marginTop: "md",
    marginBottom: "md",
  },
});

const messages = defineMessages({
  nameColumn: {
    id: "UserList.columns.name",
    defaultMessage: "Name",
  },
  createUser: {
    id: "UserList.createUser",
    defaultMessage: "Create User",
  },
  roleColumn: {
    id: "UserList.columns.role",
    defaultMessage: "Role",
  },
  viewDetails: {
    id: "UserList.viewDetails",
    defaultMessage: "View user Details",
  },
});

const UserNameCell = ({ id, name }: { id: number; name: string }) => (
  <Text
    fontWeight="semibold"
    fontSize="lg"
    data-testid={`user-${id}-name`}
    margin={0}
  >
    {name}
  </Text>
);

const UserDetailsButton = ({ id }: { id: number }) => {
  const intl = useIntl();
  const router = useRouter();

  return (
    <Button
      aria-label={intl.formatMessage(messages.viewDetails)}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/user/${id}/detail`);
      }}
      data-testid={`user-${id}-details-button`}
      variant="detail"
    >
      <Icon>
        <LuChevronRight />
      </Icon>
    </Button>
  );
};

const UserList = () => {
  const intl = useIntl();
  const router = useRouter();

  const { data, isLoading, error } = useAllUsersLazyTable();

  const roleTemplate = useCallback(
    (rowData: ExistingUser) => (
      <span>{intl.formatMessage(getUserTypeMessage(rowData.type))}</span>
    ),
    [intl],
  );

  const columns: ColumnDef<ExistingUser>[] = [
    {
      accessorKey: "name",
      enableSorting: true,
      header: intl.formatMessage(messages.nameColumn),
      cell: (info) => (
        <UserNameCell
          id={info.row.original.id}
          name={info.row.original.name}
        />
      ),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      accessorKey: "type",
      header: intl.formatMessage(messages.roleColumn),
      cell: (info) => roleTemplate(info.row.original),
      meta: {
        columnType: ColumnType.text,
      },
    },
    {
      id: "details",
      header: "",
      cell: (info) => <UserDetailsButton id={info.row.original.id} />,
      size: ColumnSize.sm,
      meta: {
        columnType: ColumnType.text,
      },
    },
  ];

  return (
    <UserListWrapper data-testid="user-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <ChakraDataTable
            data={data.items}
            columns={columns}
            isLoading={isLoading}
            includeSearchBar
            emptyStateElement={null}
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(`/user/${row.id}/detail`);
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
          />
        )}
      </SwrContent>
      <Button
        variant="primary"
        onClick={() => router.push("user/create")}
        data-testid="user-create-button"
        marginTop="md"
      >
        <HStack>
          <Icon>
            <MdAdd />
          </Icon>
          {intl.formatMessage(messages.createUser)}
        </HStack>
      </Button>
    </UserListWrapper>
  );
};

export default UserList;
