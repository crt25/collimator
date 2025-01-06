import { useContext as useContextMock } from "react";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";

const authenticationToken = "0123456789";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: jest.fn(),
}));

const useContext = useContextMock as jest.Mock;

describe("useIsAuthenticated", () => {
  it("should return true if the user is authenticated", () => {
    useContext.mockReturnValue({ authenticationToken });

    expect(useIsAuthenticated()).toBe(true);
  });

  it("should return false if the user is not authenticated", () => {
    useContext.mockReturnValue({});

    expect(useIsAuthenticated()).toBe(false);
  });
});
