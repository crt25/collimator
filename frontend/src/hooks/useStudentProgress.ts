import { useMemo } from "react";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";

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
