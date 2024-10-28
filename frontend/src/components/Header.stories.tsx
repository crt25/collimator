import {
  AuthenticatedTeacher,
  Unauthenticated,
} from "@/contexts/__tests__/decorators/authentication";
import Header from "./Header";

export default {
  component: Header,
  title: "Header",
};

export const EmptyUnauthenticated = {
  decorators: [Unauthenticated],
  args: {
    children: null,
  },
};

export const AuthenticatedWithStringContent = {
  decorators: [AuthenticatedTeacher],
  args: {
    children: "some string content",
  },
};
