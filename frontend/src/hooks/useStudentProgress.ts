import { useMemo } from "react";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";

type AnonymousStudent = {
  isAnonymous: true;
  studentId: number;
};

export type ResolvedStudent = ClassStudent | AnonymousStudent;

export const useStudentProgress = (
  klass: ExistingClassExtended | undefined,
  session: ExistingSessionExtended | undefined,
  activeStudentIds: number[],
): ResolvedStudent[] =>
  useMemo(() => {
    if (!klass || !session) {
      return [];
    }

    // In an anonymous lesson students participate with ad-hoc anonymous
    // identities, so the class roster is not part of the lesson: seeding the
    // list with it would show the real class members (with their tasks
    // eternally "not started") next to the anonymous participants, and
    // resolving ids against the roster would reveal identities. Every
    // participant is shown with an ad-hoc identity instead, even if they
    // happen to also be a registered class member (CRT-439).
    if (session.isAnonymous) {
      return [...new Set(activeStudentIds)].map<ResolvedStudent>(
        (studentId) => ({
          isAnonymous: true,
          studentId,
        }),
      );
    }

    const studentsById = new Map(
      klass.students.map((student) => [student.studentId, student]),
    );

    const studentIds = [
      ...new Set([...studentsById.keys(), ...activeStudentIds]),
    ];

    return studentIds.map<ResolvedStudent>(
      (studentId) =>
        studentsById.get(studentId) ??
        ({
          isAnonymous: true,
          studentId,
        } satisfies AnonymousStudent),
    );
  }, [klass, session, activeStudentIds]);

export const useSessionStudents = (
  classId: number,
  sessionId: number,
  activeStudentIds: number[],
): {
  klass: ExistingClassExtended | undefined;
  session: ExistingSessionExtended | undefined;
  students: ResolvedStudent[];
  errors: (Error | undefined)[];
  isLoading: boolean[];
} => {
  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const students = useStudentProgress(klass, session, activeStudentIds);

  return {
    klass,
    session,
    students,
    errors: [klassError, sessionError],
    isLoading: [isLoadingKlass, isLoadingSession],
  };
};
