import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { StorybookDecorator } from "../typing";

const buildDecorator = (key: string): StorybookDecorator =>
  function StoryWithAuthentication(Story, args) {
    return (
      <AuthenticationContext.Provider value={args.loaded[key]}>
        <Story {...args} />
      </AuthenticationContext.Provider>
    );
  };

export const AuthenticatedTeacher = buildDecorator(
  "authenticationContextTeacher",
);

export const AuthenticatedAdmin = buildDecorator("authenticationContextAdmin");

export const AuthenticatedStudent = buildDecorator(
  "authenticationContextStudent",
);

export const AuthenticatedLocalStudent = buildDecorator(
  "authenticationContextLocalStudent",
);

export const Unauthenticated = buildDecorator(
  "authenticationContextUnauthenticated",
);
