import { renderHook } from "@testing-library/react";
import useSWR from "swr";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerFindCurrentAnalysesV0,
} from "@/api/collimator/generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "@/api/collimator/hooks/authentication/useAuthenticationOptions";
import {
  fetchSolutionsAndTransform,
  useCurrentSessionTaskSolutions,
} from "../../useCurrentSessionTaskSolutions";

jest.mock("swr", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/api/collimator/generated/endpoints/solutions/solutions", () => ({
  getSolutionsControllerFindCurrentAnalysesV0Url: jest.fn(() => "/url"),
  solutionsControllerFindCurrentAnalysesV0: jest.fn(),
}));
jest.mock(
  "@/api/collimator/hooks/authentication/useAuthenticationOptions",
  () => ({ useAuthenticationOptions: jest.fn() }),
);

const useSWRMock = jest.mocked(useSWR);
const urlMock = jest.mocked(getSolutionsControllerFindCurrentAnalysesV0Url);
const endpointMock = jest.mocked(solutionsControllerFindCurrentAnalysesV0);
const authenticationOptionsMock = jest.mocked(useAuthenticationOptions);

const authOptions = { headers: { Authorization: "Bearer token" } };

beforeEach(() => {
  jest.clearAllMocks();
  authenticationOptionsMock.mockReturnValue(authOptions);
  endpointMock.mockResolvedValue({
    studentAnalyses: [],
    referenceAnalyses: [],
  } as never);
});

describe("fetchSolutionsAndTransform", () => {
  it("does not request submitted-only analyses by default", async () => {
    await fetchSolutionsAndTransform(authOptions, 1, 2, 3);

    expect(endpointMock).toHaveBeenCalledWith(1, 2, 3, {}, authOptions);
  });

  it("forwards query params to the endpoint", async () => {
    await fetchSolutionsAndTransform(authOptions, 1, 2, 3, {
      studentSolutionsOnly: true,
      ignoreStarredSolutions: true,
    });

    expect(endpointMock).toHaveBeenCalledWith(
      1,
      2,
      3,
      { studentSolutionsOnly: true, ignoreStarredSolutions: true },
      authOptions,
    );
  });

  it("returns an empty list when no task id is given", async () => {
    await expect(
      fetchSolutionsAndTransform(authOptions, 1, 2),
    ).resolves.toEqual([]);
    expect(endpointMock).not.toHaveBeenCalled();
  });
});

describe("useCurrentSessionTaskSolutions", () => {
  it("keys and fetches with the given params", () => {
    useSWRMock.mockImplementation((_key, fetcher) => {
      // invoke the fetcher so fetchSolutionsAndTransform is exercised
      void (fetcher as (() => Promise<unknown>) | null)?.();
      return { data: undefined, error: undefined, isLoading: true } as never;
    });

    const params = {
      studentSolutionsOnly: true,
      ignoreStarredSolutions: true,
    };
    renderHook(() =>
      useCurrentSessionTaskSolutions(1, 2, 3, undefined, params),
    );

    expect(urlMock).toHaveBeenCalledWith(1, 2, 3, params);
    expect(endpointMock).toHaveBeenCalledWith(1, 2, 3, params, authOptions);
  });

  it("keys all analyses by default", () => {
    useSWRMock.mockImplementation(
      () => ({ data: undefined, error: undefined, isLoading: true }) as never,
    );

    renderHook(() => useCurrentSessionTaskSolutions(1, 2, 3));

    expect(urlMock).toHaveBeenCalledWith(1, 2, 3, {});
  });
});
