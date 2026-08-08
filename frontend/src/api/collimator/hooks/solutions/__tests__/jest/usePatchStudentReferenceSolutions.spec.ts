import { act, renderHook } from "@testing-library/react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerPatchStudentReferenceSolutionsV0,
} from "@/api/collimator/generated/endpoints/solutions/solutions";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { useAuthenticationOptions } from "@/api/collimator/hooks/authentication/useAuthenticationOptions";
import { useRevalidateSolutionList } from "../../useRevalidateSolutionList";
import { usePatchStudentReferenceSolutions } from "../../usePatchStudentReferenceSolutions";

jest.mock("swr", () => ({ useSWRConfig: jest.fn() }));
jest.mock("@/api/collimator/generated/endpoints/solutions/solutions", () => ({
  getSolutionsControllerFindCurrentAnalysesV0Url: jest.fn(),
  solutionsControllerPatchStudentReferenceSolutionsV0: jest.fn(),
}));
jest.mock(
  "@/api/collimator/hooks/authentication/useAuthenticationOptions",
  () => ({ useAuthenticationOptions: jest.fn() }),
);
jest.mock("../../useRevalidateSolutionList", () => ({
  useRevalidateSolutionList: jest.fn(),
}));

const useSWRConfigMock = jest.mocked(useSWRConfig);
const patchReferencesMock = jest.mocked(
  solutionsControllerPatchStudentReferenceSolutionsV0,
);
const currentAnalysesUrlMock = jest.mocked(
  getSolutionsControllerFindCurrentAnalysesV0Url,
);
const authenticationOptionsMock = jest.mocked(useAuthenticationOptions);
const revalidateSolutionListMock = jest.mocked(useRevalidateSolutionList);

const buildAnalysis = (
  studentId: number,
  solutionHash: string,
): CurrentStudentAnalysis =>
  CurrentStudentAnalysis.fromDto({
    taskId: 3,
    solutionHash,
    isReferenceSolution: false,
    tests: [],
    studentKeyPairId: null,
    astVersion: "PYTHON_3_13",
    genericAst: "[]",
    studentId,
    studentSolutionId: null,
    isStudentSolution: false,
    isLatest: true,
    studentPseudonym: null,
    sessionId: 2,
  });

describe("usePatchStudentReferenceSolutions", () => {
  it("batches hashes and only updates matching cached analyses", async () => {
    const mutate = jest.fn();
    const revalidate = jest.fn();
    const authOptions = { headers: { Authorization: "Bearer token" } };
    const matchingFirst = buildAnalysis(4, "first");
    const matchingSecond = buildAnalysis(4, "second");
    const otherHash = buildAnalysis(4, "other");
    const otherStudent = buildAnalysis(5, "first");
    const cachedData = [matchingFirst, matchingSecond, otherHash, otherStudent];

    useSWRConfigMock.mockReturnValue({
      mutate,
      cache: { get: jest.fn(() => ({ data: cachedData })) },
    } as never);
    authenticationOptionsMock.mockReturnValue(authOptions);
    revalidateSolutionListMock.mockReturnValue(revalidate);
    currentAnalysesUrlMock.mockReturnValue("/current-analyses");
    patchReferencesMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePatchStudentReferenceSolutions());

    await act(() => result.current(1, 2, 3, 4, ["first", "second"], true));

    expect(patchReferencesMock).toHaveBeenCalledWith(
      1,
      2,
      3,
      4,
      { isReference: true, solutionHashes: ["first", "second"] },
      undefined,
      authOptions,
    );
    expect(revalidate).toHaveBeenCalledWith(1, 2, 3);
    expect(mutate).toHaveBeenCalledWith(
      "/current-analyses",
      expect.any(Array),
      { revalidate: false },
    );
    expect(mutate.mock.invocationCallOrder[0]).toBeLessThan(
      revalidate.mock.invocationCallOrder[0],
    );

    const updatedData = mutate.mock.calls[0][1] as CurrentStudentAnalysis[];
    expect(
      updatedData.map((analysis) => ({
        studentId: analysis.studentId,
        solutionHash: analysis.solutionHash,
        isReferenceSolution: analysis.isReferenceSolution,
        sameInstance:
          analysis ===
          cachedData.find(
            (cached) =>
              cached.studentId === analysis.studentId &&
              cached.solutionHash === analysis.solutionHash,
          ),
      })),
    ).toEqual([
      {
        studentId: 4,
        solutionHash: "first",
        isReferenceSolution: true,
        sameInstance: false,
      },
      {
        studentId: 4,
        solutionHash: "second",
        isReferenceSolution: true,
        sameInstance: false,
      },
      {
        studentId: 4,
        solutionHash: "other",
        isReferenceSolution: false,
        sameInstance: true,
      },
      {
        studentId: 5,
        solutionHash: "first",
        isReferenceSolution: false,
        sameInstance: true,
      },
    ]);
  });
});
