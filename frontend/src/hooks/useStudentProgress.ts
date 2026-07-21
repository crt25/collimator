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
  activeStudentIds: number[],
): ResolvedStudent[] =>
  useMemo(() => {
    if (!klass) {
      return [];
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
  }, [klass, activeStudentIds]);

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

  const students = useStudentProgress(klass, activeStudentIds);

  return {
    klass,
    session,
    students,
    errors: [klassError, sessionError],
    isLoading: [isLoadingKlass, isLoadingSession],
  };
};
