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
  session: ExistingSessionExtended | undefined,
  activeStudentIds: number[],
): ResolvedStudent[] =>
  useMemo(() => {
    if (!session) {
      return [];
    }

    // The lesson's own students seed the list, so a participant is visible
    // before they start their first task (CRT-454). A participant without a
    // pseudonym renders under an ad-hoc identity: the backend never resolves
    // participants of an anonymous lesson to an identity, even when they are
    // also enrolled in the class (CRT-439).
    const studentsById = new Map(
      session.students.map((student) => [student.studentId, student]),
    );

    const studentIds = [
      ...new Set([...studentsById.keys(), ...activeStudentIds]),
    ];

    return studentIds.map<ResolvedStudent>((studentId) => {
      const student = studentsById.get(studentId);

      return student && student.pseudonym !== null
        ? {
            studentId,
            pseudonym: student.pseudonym,
            keyPairId: student.keyPairId,
          }
        : { isAnonymous: true, studentId };
    });
  }, [session, activeStudentIds]);

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

  const students = useStudentProgress(session, activeStudentIds);

  return {
    klass,
    session,
    students,
    errors: [klassError, sessionError],
    isLoading: [isLoadingKlass, isLoadingSession],
  };
};
