import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { useRouter as useRouterMock } from "next/router";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import AuthenticationBarrier from "@/components/authentication/AuthenticationBarrier";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// the barrier only decides what to render/redirect; the expiration polling and
// the SSR wrapper are irrelevant here
jest.mock("@/hooks/useAuthExpirationCheck", () => ({
  useAuthExpirationCheck: jest.fn(),
}));
jest.mock("@/components/next/DisableSSR", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const useRouter = useRouterMock as jest.Mock;
const replace = jest.fn();

const renderAt = (
  pathname: string,
  role: UserRole | undefined,
): ReturnType<typeof render> => {
  useRouter.mockReturnValue({ pathname, asPath: pathname, replace });

  return render(
    <AuthenticationContext.Provider
      value={
        {
          version: "2",
          authenticationToken: role === undefined ? undefined : "token",
          role,
        } as never
      }
    >
      <AuthenticationBarrier authenticationStateLoaded>
        <div>page content</div>
      </AuthenticationBarrier>
    </AuthenticationContext.Provider>,
  );
};

// User management is admin-only. The navigation entry and home-page card are
// already hidden from teachers, but the pages themselves were reachable by
// typing the URL - a teacher saw the whole User Manager and a Create User
// button that only failed with a 403 on submit.
describe("AuthenticationBarrier — admin-only user management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(["/user", "/user/create", "/user/[userId]/detail"])(
    "keeps a teacher out of %s",
    (pathname) => {
      // queryByText, not getByText: the teacher is redirected so "page content"
      // is absent, and getByText throws on a missing element instead of letting
      // the .not.toBeInTheDocument() assertion run.
      const { queryByText } = renderAt(pathname, UserRole.teacher);

      expect(queryByText("page content")).not.toBeInTheDocument();
      // sent home, not to the login page: signing in again would not help
      expect(replace).toHaveBeenCalledWith("/");
      expect(replace).toHaveBeenCalledTimes(1);
    },
  );

  it("lets an admin into the user manager", () => {
    const { getByText } = renderAt("/user", UserRole.admin);

    expect(getByText("page content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  // positive control: the new rule must not affect the pages teachers use
  it("still lets a teacher into the class manager", () => {
    const { getByText } = renderAt("/class", UserRole.teacher);

    expect(getByText("page content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
