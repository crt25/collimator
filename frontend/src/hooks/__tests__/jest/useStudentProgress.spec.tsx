import { renderHook } from "@testing-library/react";
import {
  ExistingSessionExtendedDto,
  SessionStatus,
  SessionStudentDto,
} from "@/api/collimator/generated/models";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useStudentProgress } from "@/hooks/useStudentProgress";

const buildSession = (
  isAnonymous: boolean,
  students: SessionStudentDto[],
): ExistingSessionExtended =>
  ExistingSessionExtended.fromDto({
    id: 3,
    title: "a lesson",
    description: "",
    isAnonymous,
    createdAt: "2026-08-06T00:00:00.000Z",
    class: { id: 1, name: "a class" },
    status: SessionStatus.ONGOING,
    tasks: [],
    hasStudents: students.length > 0,
    students,
  } as unknown as ExistingSessionExtendedDto);

describe("useStudentProgress", () => {
  it("lists an anonymous student who joined without starting a task", () => {
    const session = buildSession(true, [
      { studentId: 7, pseudonym: null, keyPairId: null },
    ]);

    const { result } = renderHook(() => useStudentProgress(session, []));

    expect(result.current).toEqual([{ isAnonymous: true, studentId: 7 }]);
  });

  it("merges joined and active students without duplicates", () => {
    const session = buildSession(true, [
      { studentId: 7, pseudonym: null, keyPairId: null },
      { studentId: 8, pseudonym: null, keyPairId: null },
    ]);

    const { result } = renderHook(() => useStudentProgress(session, [8, 9]));

    expect(result.current).toEqual([
      { isAnonymous: true, studentId: 7 },
      { isAnonymous: true, studentId: 8 },
      { isAnonymous: true, studentId: 9 },
    ]);
  });

  it("resolves a student with a pseudonym to their identity", () => {
    const session = buildSession(false, [
      { studentId: 4, pseudonym: "cGxhaW4=", keyPairId: 11 },
    ]);

    const { result } = renderHook(() => useStudentProgress(session, []));

    expect(result.current).toEqual([
      { studentId: 4, pseudonym: "cGxhaW4=", keyPairId: 11 },
    ]);
  });

  it("renders a participant without a pseudonym anonymously", () => {
    // CRT-439: the backend never sends a pseudonym for participants of an
    // anonymous lesson, even for registered class members - such a student
    // must render under an ad-hoc identity
    const session = buildSession(true, [
      { studentId: 7, pseudonym: null, keyPairId: null },
    ]);

    const { result } = renderHook(() => useStudentProgress(session, [7]));

    expect(result.current).toEqual([{ isAnonymous: true, studentId: 7 }]);
  });

  it("falls back to an ad-hoc identity for an active student the lesson does not know", () => {
    const session = buildSession(false, [
      { studentId: 4, pseudonym: "cGxhaW4=", keyPairId: 11 },
    ]);

    const { result } = renderHook(() => useStudentProgress(session, [5]));

    expect(result.current).toEqual([
      { studentId: 4, pseudonym: "cGxhaW4=", keyPairId: 11 },
      { isAnonymous: true, studentId: 5 },
    ]);
  });
});
