import { Column } from "primereact/column";
import { useCallback, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { Icon, ButtonGroup, IconButton } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DataTable from "@/components/DataTable";
import { getUserTypeMessage } from "@/i18n/user-type-messages";
import { TableMessages } from "@/i18n/table-messages";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";
import { useAllUsersLazyTable } from "@/api/collimator/hooks/users/useAllUsers";
import { useDeleteUser } from "@/api/collimator/hooks/users/useDeleteUser";
import { useGenerateRegistrationToken } from "@/api/collimator/hooks/users/useGenerateRegistrationToken";
import ConfirmationModal from "../modals/ConfirmationModal";
import SwrContent from "../SwrContent";
import Button, { ButtonVariant } from "../Button";
import DropdownMenu from "../DropdownMenu";

const UserListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const messages = defineMessages({
  nameColumn: {
    id: "UserList.columns.name",
    defaultMessage: "Name",
  },
  roleColumn: {
    id: "UserList.columns.role",
    defaultMessage: "Role",
  },
  actionsColumn: {
    id: "UserList.columns.actions",
    defaultMessage: "Actions",
  },
  deleteConfirmationTitle: {
    id: "UserList.deleteConfirmation.title",
    defaultMessage: "Delete User",
  },
  deleteConfirmationBody: {
    id: "UserList.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this user?",
  },
  deleteConfirmationConfirm: {
    id: "UserList.deleteConfirmation.confirm",
    defaultMessage: "Delete User",
  },
  generateRegistrationToken: {
    id: "UserList.generateRegistrationToken",
    defaultMessage: "Get registration link",
  },
});

const userNameTemplate = (rowData: ExistingUser) => (
  <span data-testid={`user-${rowData.id}-name`}>{rowData.name}</span>
);

const UserList = () => {
  const intl = useIntl();
  const router = useRouter();

  const { data, isLoading, error } = useAllUsersLazyTable();
  const generateRegistrationToken = useGenerateRegistrationToken();

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const deleteUser = useDeleteUser();

  const roleTemplate = useCallback(
    (rowData: ExistingUser) => (
      <span>{intl.formatMessage(getUserTypeMessage(rowData.type))}</span>
    ),
    [intl],
  );

  const actionsTemplate = useCallback(
    (rowData: ExistingUser) => (
      <ButtonGroup>
        <Button
          variant={ButtonVariant.primary}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/user/${rowData.id}/edit`);
          }}
          data-testid={`user-${rowData.id}-edit-button`}
        >
          <Icon>
            <FaEdit />
          </Icon>
        </Button>
        <DropdownMenu
          trigger={
            <IconButton
              aria-label="Actions"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <LuChevronDown />
            </IconButton>
          }
          isButton={true}
          data-testid={`user-${rowData.id}-actions-dropdown-button`}
        >
          <DropdownMenu.Item
            onClick={() => {
              setUserIdToDelete(rowData.id);
              setShowDeleteConfirmationModal(true);
            }}
            data-testid={`user-${rowData.id}-delete-button`}
          >
            {intl.formatMessage(TableMessages.delete)}
          </DropdownMenu.Item>
          {rowData.oidcSub === null && (
            <DropdownMenu.Item
              onClick={async () => {
                const token = await generateRegistrationToken(rowData.id);

                navigator.clipboard.writeText(
                  `${window.location.origin}/login?registrationToken=${token}`,
                );
              }}
              data-testid={`user-${rowData.id}-generate-registration-token-button`}
            >
              {intl.formatMessage(messages.generateRegistrationToken)}
            </DropdownMenu.Item>
          )}
        </DropdownMenu>
      </ButtonGroup>
    ),
    [router, intl, generateRegistrationToken],
  );

  return (
    <UserListWrapper data-testid="user-list">
      <SwrContent data={data} isLoading={isLoading} error={error}>
        {(data) => (
          <DataTable
            value={data.items}
            filterDisplay="row"
            dataKey="id"
            paginator
            rows={10}
            totalRecords={data.totalCount}
            loading={isLoading}
            onRowClick={(e) =>
              router.push(`/user/${(e.data as ExistingUser).id}/detail`)
            }
          >
            <Column
              field="name"
              header={intl.formatMessage(messages.nameColumn)}
              sortable
              filter
              filterPlaceholder={intl.formatMessage(
                TableMessages.searchFilterPlaceholder,
              )}
              filterMatchMode="contains"
              showFilterMenu={false}
              body={userNameTemplate}
            />
            <Column
              field="role"
              header={intl.formatMessage(messages.roleColumn)}
              filter
              filterPlaceholder={intl.formatMessage(
                TableMessages.searchFilterPlaceholder,
              )}
              filterMatchMode="contains"
              showFilterMenu={false}
              body={roleTemplate}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("user/create");
                      }}
                      data-testid="user-create-button"
                    >
                      <Icon>
                        <MdAdd />
                      </Icon>
                    </Button>
                  }
                  isButton={true}
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
          userIdToDelete ? () => deleteUser(userIdToDelete) : undefined
        }
        isDangerous
        messages={{
          title: messages.deleteConfirmationTitle,
          body: messages.deleteConfirmationBody,
          confirmButton: messages.deleteConfirmationConfirm,
        }}
      />
    </UserListWrapper>
  );
};

export default UserList;
