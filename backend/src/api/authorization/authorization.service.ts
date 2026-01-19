import { Injectable } from "@nestjs/common";
import { Student, User, UserType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentSolutionId } from "../solutions/dto/existing-student-solution.dto";

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  protected async isUserTeacherOfClass(
    userId: number,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    const whereWithSoftDelete = includeSoftDeleted
      ? { id: classId, teacherId: userId }
      : { id: classId, teacherId: userId, deletedAt: null };

    const klass = await this.prisma.class.findUnique({
      where: whereWithSoftDelete,
      select: { id: true },
    });

    return klass !== null;
  }

  canSignInStudent(
    teacher: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (teacher.type !== UserType.ADMIN && teacher.type !== UserType.TEACHER) {
      return Promise.resolve(false);
    }

    return this.isUserTeacherOfClass(teacher.id, classId, includeSoftDeleted);
  }

  async canUpdateUser(
    authenticatedUser: User,
    userId: number,
    newUserType: UserType,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    // if the user is not an admin, they can only update their own user type
    // but not change their own user type

    return (
      authenticatedUser.id === userId && authenticatedUser.type === newUserType
    );
  }

  async canViewUser(authenticatedUser: User, userId: number): Promise<boolean> {
    return (
      // everybody can view themselves
      authenticatedUser.id === userId ||
      // admins can view all users
      authenticatedUser.type === UserType.ADMIN
    );
  }

  protected async isAdminOrCreatorOfTask(
    authenticatedUser: User,
    taskId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const whereWithSoftDelete = includeSoftDeleted
      ? { id: taskId, creatorId: authenticatedUser.id }
      : { id: taskId, creatorId: authenticatedUser.id, deletedAt: null };

    const task = await this.prisma.task.findUnique({
      where: whereWithSoftDelete,
      select: { id: true },
    });

    return task !== null;
  }

  async canUpdateTask(
    authenticatedUser: User,
    taskId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrCreatorOfTask(
      authenticatedUser,
      taskId,
      includeSoftDeleted,
    );
  }

  async canDeleteTask(
    authenticatedUser: User,
    taskId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrCreatorOfTask(
      authenticatedUser,
      taskId,
      includeSoftDeleted,
    );
  }

  protected async isAdminOrTeacherOfClass(
    authenticatedUser: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    return this.isUserTeacherOfClass(
      authenticatedUser.id,
      classId,
      includeSoftDeleted,
    );
  }

  async canListClassesOfTeacher(
    authenticatedUser: User,
    teacherId?: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    // teachers can only list their own classes
    return (
      authenticatedUser.type === UserType.TEACHER &&
      teacherId !== undefined &&
      authenticatedUser.id === teacherId
    );
  }

  async canViewClass(
    authenticatedUser: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(
      authenticatedUser,
      classId,
      includeSoftDeleted,
    );
  }

  async canUpdateClass(
    authenticatedUser: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(
      authenticatedUser,
      classId,
      includeSoftDeleted,
    );
  }

  async canDeleteClass(
    authenticatedUser: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(
      authenticatedUser,
      classId,
      includeSoftDeleted,
    );
  }

  async canCreateSession(
    authenticatedUser: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(
      authenticatedUser,
      classId,
      includeSoftDeleted,
    );
  }

  async canListSessions(
    authenticatedUser: User,
    classId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(
      authenticatedUser,
      classId,
      includeSoftDeleted,
    );
  }

  protected async isAdminOrTeacherOfSession(
    authenticatedUser: User,
    sessionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const whereWithSoftDelete = includeSoftDeleted
      ? { id: sessionId, class: { teacherId: authenticatedUser.id } }
      : {
          id: sessionId,
          class: { teacherId: authenticatedUser.id },
          deletedAt: null,
        };

    const session = await this.prisma.session.findUnique({
      where: whereWithSoftDelete,
      select: { id: true },
    });

    return authenticatedUser.type === UserType.TEACHER && session !== null;
  }

  async canViewSession(
    authenticatedUser: User | null,
    authenticatedStudent: Student | null,
    sessionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser) {
      return this.isAdminOrTeacherOfSession(
        authenticatedUser,
        sessionId,
        includeSoftDeleted,
      );
    }

    if (authenticatedStudent) {
      const authenticatedStudents = {
        id: sessionId,
        OR: [
          {
            class: {
              students: { some: { studentId: authenticatedStudent.id } },
            },
          },
          { isAnonymous: true },
        ],
      };

      const whereWithSoftDelete = includeSoftDeleted
        ? authenticatedStudents
        : { ...authenticatedStudents, deletedAt: null };

      const session = await this.prisma.session.findUnique({
        where: whereWithSoftDelete,
        select: { id: true },
      });

      return session !== null;
    }

    return false;
  }

  async canUpdateSession(
    authenticatedUser: User,
    sessionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfSession(
      authenticatedUser,
      sessionId,
      includeSoftDeleted,
    );
  }

  async canDeleteSession(
    authenticatedUser: User,
    sessionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfSession(
      authenticatedUser,
      sessionId,
      includeSoftDeleted,
    );
  }

  async canListSolutions(
    authenticatedUser: User,
    sessionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const whereWithSoftDelete = includeSoftDeleted
      ? { id: sessionId, class: { teacherId: authenticatedUser.id } }
      : {
          id: sessionId,
          class: { teacherId: authenticatedUser.id },
          deletedAt: null,
        };

    const session = await this.prisma.session.findUnique({
      where: whereWithSoftDelete,
      select: { id: true },
    });

    return authenticatedUser.type === UserType.TEACHER && session !== null;
  }

  async canListCurrentAnalyses(
    authenticatedUser: User,
    sessionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const whereWithSoftDelete = includeSoftDeleted
      ? { id: sessionId, class: { teacherId: authenticatedUser.id } }
      : {
          id: sessionId,
          class: { teacherId: authenticatedUser.id },
          deletedAt: null,
        };

    const session = await this.prisma.session.findUnique({
      where: whereWithSoftDelete,
      select: { id: true },
    });

    return authenticatedUser.type === UserType.TEACHER && session !== null;
  }

  async canViewStudentSolution(
    authenticatedUser: User | null,
    authenticatedStudent: Student | null,
    studentSolutionId: number,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser === null && authenticatedStudent === null) {
      return false;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const whereWithSoftDelete = includeSoftDeleted
      ? { id: studentSolutionId }
      : {
          id: studentSolutionId,
          deletedAt: null,
          session: {
            deletedAt: null,
            class: {
              deletedAt: null,
            },
          },
        };

    const solution = await this.prisma.studentSolution.findUniqueOrThrow({
      where: whereWithSoftDelete,
      include: {
        student: { select: { id: true } },
        session: { select: { class: { select: { teacherId: true } } } },
      },
    });

    if (authenticatedStudent) {
      // if we submitted the solution, we can view it
      return solution.student.id === authenticatedStudent.id;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.TEACHER) {
      // if we are the teacher of the class, we can view the solution
      return solution.session.class.teacherId === authenticatedUser.id;
    }

    // this line is not reachable but typescript doesn't know that
    // the first guard ensures that either authenticatedUser or authenticatedStudent is not null
    return false;
  }

  async canViewSolution(
    authenticatedUser: User | null,
    authenticatedStudent: Student | null,
    taskId: number,
    solutionHash: Uint8Array,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser === null && authenticatedStudent === null) {
      return false;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const baseWhere = {
      taskId_hash: { taskId, hash: solutionHash },
    };

    if (authenticatedStudent) {
      const whereWithSoftDelete = includeSoftDeleted
        ? {
            ...baseWhere,
            studentSolutions: {
              some: {
                student: { id: authenticatedStudent.id },
              },
            },
          }
        : {
            ...baseWhere,
            deletedAt: null,
            studentSolutions: {
              some: {
                student: { id: authenticatedStudent.id },
                deletedAt: null,
              },
            },
          };

      // students may only view solutions they submitted
      const solution = await this.prisma.solution.findUnique({
        select: {},
        where: whereWithSoftDelete,
      });

      return solution !== null;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.TEACHER) {
      // users may view solutions submitted by students in their class
      // and reference solutions.

      const whereWithSoftDelete = includeSoftDeleted
        ? {
            ...baseWhere,
            OR: [
              {
                studentSolutions: {
                  some: {
                    session: {
                      class: {
                        teacherId: authenticatedUser.id,
                      },
                    },
                  },
                },
              },
              {
                referenceSolutions: {
                  some: {},
                },
              },
            ],
          }
        : {
            ...baseWhere,
            deletedAt: null,
            OR: [
              {
                studentSolutions: {
                  some: {
                    deletedAt: null,
                    session: {
                      deletedAt: null,
                      class: {
                        teacherId: authenticatedUser.id,
                        deletedAt: null,
                      },
                    },
                  },
                },
              },
              {
                referenceSolutions: {
                  some: { deletedAt: null },
                },
              },
            ],
          };

      const solution = await this.prisma.solution.findUnique({
        select: {},
        where: whereWithSoftDelete,
      });

      return solution !== null;
    }

    // this line is not reachable but typescript doesn't know that
    // the first guard ensures that either authenticatedUser or authenticatedStudent is not null
    return false;
  }

  async canUpdateStudentSolutionIsReference(
    authenticatedUser: User | null,
    studentSolutionId: StudentSolutionId,
    includeSoftDeleted = false,
  ): Promise<boolean> {
    if (authenticatedUser === null) {
      return false;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const whereWithSoftDelete = includeSoftDeleted
      ? {
          id: studentSolutionId,
          session: {
            class: {
              teacherId: authenticatedUser.id,
            },
          },
        }
      : {
          id: studentSolutionId,
          deletedAt: null,
          session: {
            deletedAt: null,
            class: {
              teacherId: authenticatedUser.id,
              deletedAt: null,
            },
          },
        };

    // teachers may updated the field for solutions submitted by students in their class
    const solution = await this.prisma.studentSolution.findUnique({
      select: {},
      where: whereWithSoftDelete,
    });

    return authenticatedUser.type === UserType.TEACHER && solution !== null;
  }
}
