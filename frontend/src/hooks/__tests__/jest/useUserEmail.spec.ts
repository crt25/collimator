import { useUserEmail } from "@/hooks/useUserEmail";
import { useContext as useContextMock } from "react";

const email = "john@doe.com";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: jest.fn(),
}));

const useContext = useContextMock as jest.Mock;

describe("useUserEmail", () => {
  it("should return the user email if the user is authenticated", () => {
    useContext.mockReturnValue({ email });

    expect(useUserEmail()).toBe(email);
  });

  it("should return the undefined if the user is not authenticated", () => {
    useContext.mockReturnValue({});

    expect(useUserEmail()).toBe(undefined);
  });
});
