import UserList, { User } from "./UserList";
import { mockFilterSortDataTable } from "../__tests__/data-table";
import { UserRole } from "@/i18n/user-role-messages";

export default {
  component: UserList,
  title: "UserList",
};

const users: User[] = [
  {
    id: 1,
    name: "User 1",
    role: UserRole.teacher,
  },
  {
    id: 2,
    name: "User 2",
    role: UserRole.student,
  },
  {
    id: 3,
    name: "User 3",
    role: UserRole.student,
  },
  {
    id: 4,
    name: "User 4",
    role: UserRole.admin,
  },
  {
    id: 5,
    name: "User 5",
    role: UserRole.student,
  },
  {
    id: 6,
    name: "User 6",
    role: UserRole.teacher,
  },
  {
    id: 7,
    name: "User 7",
    role: UserRole.student,
  },
  {
    id: 8,
    name: "User 8",
    role: UserRole.admin,
  },
  {
    id: 9,
    name: "User 9",
    role: UserRole.admin,
  },
  {
    id: 10,
    name: "User 10",
    role: UserRole.admin,
  },
  {
    id: 11,
    name: "User 11",
    role: UserRole.admin,
  },
];

type Args = Parameters<typeof UserList>[0];

export const Default = {
  args: {
    fetchData: (state) =>
      Promise.resolve(mockFilterSortDataTable(users, state)),
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
