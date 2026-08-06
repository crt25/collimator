import { renderHook } from "@testing-library/react";
import {
  ExistingClassExtendedDto,
  ExistingSessionExtendedDto,
  SessionStatus,
} from "@/api/collimator/generated/models";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useStudentProgress } from "@/hooks/useStudentProgress";

const buildClass = (
  students: {
    studentId: number;
    pseudonym: string;
    keyPairId: number | null;
  }[],
): ExistingClassExtended =>
  ExistingClassExtended.fromDto({
    id: 1,
    name: "a class",
    teacher: { id: 2, name: "the teacher" },
    sessions: [],
    students,
  } as unknown as ExistingClassExtendedDto);

const buildSession = (
  isAnonymous: boolean,
  anonymousStudentIds: number[],
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
    hasStudents: anonymousStudentIds.length > 0,
    anonymousStudentIds,
  } as unknown as ExistingSessionExtendedDto);

describe("useStudentProgress", () => {
  it("lists an anonymous student who joined without starting a task", () => {
    const klass = buildClass([]);
    const session = buildSession(true, [7]);

    const { result } = renderHook(() => useStudentProgress(klass, session, []));

    expect(result.current).toEqual([{ isAnonymous: true, studentId: 7 }]);
  });

  it("merges joined and active anonymous students without duplicates", () => {
    const klass = buildClass([]);
    const session = buildSession(true, [7, 8]);

    const { result } = renderHook(() =>
      useStudentProgress(klass, session, [8, 9]),
    );

    expect(result.current).toEqual([
      { isAnonymous: true, studentId: 7 },
      { isAnonymous: true, studentId: 8 },
      { isAnonymous: true, studentId: 9 },
    ]);
  });

  it("never resolves anonymous participants against the class roster", () => {
    // CRT-439: even a registered class member participates in an anonymous
    // lesson under an ad-hoc identity
    const klass = buildClass([
      { studentId: 7, pseudonym: "real-name", keyPairId: null },
    ]);
    const session = buildSession(true, [7]);

    const { result } = renderHook(() => useStudentProgress(klass, session, []));

    expect(result.current).toEqual([{ isAnonymous: true, studentId: 7 }]);
  });

  it("seeds a class-roster lesson from the roster", () => {
    const klass = buildClass([
      { studentId: 4, pseudonym: "enrolled", keyPairId: null },
    ]);
    const session = buildSession(false, []);

    const { result } = renderHook(() => useStudentProgress(klass, session, []));

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({ studentId: 4 });
  });
});
