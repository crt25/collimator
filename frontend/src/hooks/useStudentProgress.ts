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

    const studentIds = [
      ...new Set([
        ...klass.students.map((student) => student.studentId),
        ...activeStudentIds,
      ]),
    ];

    return studentIds.map<ResolvedStudent>((studentId) => {
      const student = klass.students.find((s) => s.studentId === studentId);

      return (
        student ??
        ({
          isAnonymous: true,
          studentId,
        } satisfies AnonymousStudent)
      );
    });
  }, [klass, activeStudentIds]);
