import UserList from "./UserList";
import { mockFilterSortDataTable } from "../__tests__/data-table";
import { getUsersControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

export default {
  component: UserList,
  title: "UserList",
};

type Args = Parameters<typeof UserList>[0];

export const Default = {
  args: {
    fetchData: (state) =>
      Promise.resolve(
        mockFilterSortDataTable(getUsersControllerFindAllResponseMock(), state),
      ),
  } as Args,
};

export const Empty = {
  args: {
    classId: 1,
    fetchData: () => Promise.resolve({ items: [], totalCount: 0 }),
  } as Args,
};

export const Loading = {
  args: {
    classId: 1,
    fetchData: () => new Promise(() => {}),
  } as Args,
};
