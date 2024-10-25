import { useDeAuthenticate } from "@/hooks/useDeAuthenticate";
import { useContext as useContextMock } from "react";
import { useRouter as useRouterMock } from "next/router";
import { authenticationContextDefaultValue } from "@/contexts/AuthenticationContext";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: jest.fn(),
  useCallback: <T>(fn: T): T => fn,
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const useContext = useContextMock as jest.Mock;
const useRouter = useRouterMock as jest.Mock;

const updateAuthenticationContext = jest.fn();
const routerPush = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  useContext.mockReturnValue(updateAuthenticationContext);
  useRouter.mockReturnValue({ push: routerPush });
});

describe("useDeAuthenticate", () => {
  it("should reset the authenticationstate", () => {
    const deAuthenticate = useDeAuthenticate();

    expect(updateAuthenticationContext).toHaveBeenCalledTimes(0);

    deAuthenticate();

    expect(updateAuthenticationContext).toHaveBeenCalledTimes(1);
    expect(updateAuthenticationContext).toHaveBeenCalledWith(
      authenticationContextDefaultValue,
    );
  });

  it("should redirect to the login page", () => {
    const deAuthenticate = useDeAuthenticate();

    expect(routerPush).toHaveBeenCalledTimes(0);

    deAuthenticate();

    expect(routerPush).toHaveBeenCalledTimes(1);
    expect(routerPush).toHaveBeenCalledWith("/login");
  });
});
