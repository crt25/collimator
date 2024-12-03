import { useUserName } from "@/hooks/useUserName";
import { useContext as useContextMock } from "react";

const name = "John Doe";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: jest.fn(),
}));

const useContext = useContextMock as jest.Mock;

describe("useUserName", () => {
  it("should return the user name if the user is authenticated", () => {
    useContext.mockReturnValue({ name });

    expect(useUserName()).toBe(name);
  });

  it("should return the undefined if the user is not authenticated", () => {
    useContext.mockReturnValue({});

    expect(useUserName()).toBe(undefined);
  });
});
