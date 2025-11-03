import { Column } from "primereact/column";
import { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
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
import Dropdown, { DropdownItem } from "../Dropdown";

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
      <Dropdown
        trigger={
          <Button
            variant={ButtonVariant.secondary}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user/${rowData.id}/edit`);
            }}
            data-testid={`user-${rowData.id}-edit-button`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
        }
      >
        <DropdownItem
          onClick={() => {
            setUserIdToDelete(rowData.id);
            setShowDeleteConfirmationModal(true);
          }}
          data-testid={`user-${rowData.id}-delete-button`}
        >
          {intl.formatMessage(TableMessages.delete)}
        </DropdownItem>
        {rowData.oidcSub === null && (
          <DropdownItem
            onClick={async () => {
              const token = await generateRegistrationToken(rowData.id);

              navigator.clipboard.writeText(
                `${window.location.origin}/login?registrationToken=${token}`,
              );
            }}
            data-testid={`user-${rowData.id}-generate-registration-token-button`}
          >
            {intl.formatMessage(messages.generateRegistrationToken)}
          </DropdownItem>
        )}
      </Dropdown>
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
                <Dropdown
                  trigger={
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => router.push("user/create")}
                      data-testid="user-create-button"
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
