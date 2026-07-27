import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/helpers/render-with-providers";
import ErrorMessage from "@/components/ErrorMessage";
import { ApiError, NetworkError } from "@/errors/api";

describe("ErrorMessage", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("shows a connectivity message when the backend is unreachable", () => {
    renderWithProviders(
      <ErrorMessage
        error={new NetworkError(new TypeError("Failed to fetch"))}
      />,
    );

    expect(
      screen.getByText(
        "The server could not be reached. Please check your internet connection and try again.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a generic message for errors answered by the server", () => {
    renderWithProviders(
      <ErrorMessage error={new ApiError(500, "Internal server error")} />,
    );

    expect(
      screen.getByText(
        "An error occurred while loading this content. Please try again later.",
      ),
    ).toBeInTheDocument();
  });

  it("never renders the raw error message", () => {
    renderWithProviders(
      <ErrorMessage error={new TypeError("Failed to fetch")} />,
    );

    expect(screen.queryByText(/failed to fetch/i)).not.toBeInTheDocument();
  });

  it("keeps the technical detail available to developers in the console", () => {
    const error = new NetworkError(new TypeError("Failed to fetch"));

    renderWithProviders(<ErrorMessage error={error} />);

    expect(consoleError).toHaveBeenCalledWith(
      "[ErrorMessage] NetworkError: The backend could not be reached",
      error,
    );
  });
});
