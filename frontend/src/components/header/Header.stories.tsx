import Header from "./Header";
import {
  AuthenticatedTeacher,
  Unauthenticated,
} from "@/contexts/__tests__/decorators/authentication";

export default {
  component: Header,
  title: "Header",
};

export const EmptyUnauthenticated = {
  decorators: [Unauthenticated],
  args: {
    title: {
      id: "some.id",
      defaultMessage: "the HTML title",
    },
    children: null,
  },
};

export const AuthenticatedWithStringContent = {
  decorators: [AuthenticatedTeacher],
  args: {
    title: {
      id: "some.id",
      defaultMessage: "the HTML title",
    },
    children: "some string content",
  },
};
