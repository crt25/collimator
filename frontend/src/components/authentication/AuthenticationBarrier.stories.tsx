import {
  AuthenticatedTeacher,
  Unauthenticated as UnauthenticatedDecorator,
} from "@/contexts/__tests__/decorators/authentication";
import AuthenticationBarrier from "./AuthenticationBarrier";

export default {
  component: AuthenticationBarrier,
  title: "AuthenticationBarrier",
};

export const Unauthenticated = {
  decorators: [UnauthenticatedDecorator],
  args: {
    children: "content",
  },
};

export const Authenticated = {
  decorators: [AuthenticatedTeacher],
  args: {
    children: "content",
  },
};
