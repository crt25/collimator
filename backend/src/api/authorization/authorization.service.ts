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
  ): Promise<boolean> {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId, teacherId: userId, deletedAt: null },
      select: { id: true },
    });

    return klass !== null;
  }

  canSignInStudent(teacher: User, classId: number): Promise<boolean> {
    if (teacher.type !== UserType.ADMIN && teacher.type !== UserType.TEACHER) {
      return Promise.resolve(false);
    }

    return this.isUserTeacherOfClass(teacher.id, classId);
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
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId, creatorId: authenticatedUser.id, deletedAt: null },
      select: { id: true },
    });

    return task !== null;
  }

  async canViewTask(authenticatedUser: User, taskId: number): Promise<boolean> {
    if (await this.isAdminOrCreatorOfTask(authenticatedUser, taskId)) {
      return true;
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId, isPublic: true },
      select: { id: true },
    });

    return task !== null;
  }

  async canListTasksOfTeacher(
    authenticatedUser: User,
    teacherId?: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    // teachers can only list their own tasks
    return (
      authenticatedUser.type === UserType.TEACHER &&
      teacherId !== undefined &&
      authenticatedUser.id === teacherId
    );
  }

  async canUpdateTask(
    authenticatedUser: User,
    taskId: number,
  ): Promise<boolean> {
    return this.isAdminOrCreatorOfTask(authenticatedUser, taskId);
  }

  async canDeleteTask(
    authenticatedUser: User,
    taskId: number,
  ): Promise<boolean> {
    return this.isAdminOrCreatorOfTask(authenticatedUser, taskId);
  }

  protected async isAdminOrTeacherOfClass(
    authenticatedUser: User,
    classId: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    return this.isUserTeacherOfClass(authenticatedUser.id, classId);
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
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(authenticatedUser, classId);
  }

  async canUpdateClass(
    authenticatedUser: User,
    classId: number,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(authenticatedUser, classId);
  }

  async canDeleteClass(
    authenticatedUser: User,
    classId: number,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(authenticatedUser, classId);
  }

  async canCreateSession(
    authenticatedUser: User,
    classId: number,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(authenticatedUser, classId);
  }

  async canListSessions(
    authenticatedUser: User,
    classId: number,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfClass(authenticatedUser, classId);
  }

  protected async isAdminOrTeacherOfSession(
    authenticatedUser: User,
    sessionId: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
        class: {
          teacherId: authenticatedUser.id,
          deletedAt: null,
          teacher: { deletedAt: null },
        },
        deletedAt: null,
      },
      select: { id: true },
    });

    return authenticatedUser.type === UserType.TEACHER && session !== null;
  }

  async canViewSession(
    authenticatedUser: User | null,
    authenticatedStudent: Student | null,
    sessionId: number,
  ): Promise<boolean> {
    if (authenticatedUser) {
      return this.isAdminOrTeacherOfSession(authenticatedUser, sessionId);
    }

    if (authenticatedStudent) {
      const session = await this.prisma.session.findUnique({
        where: {
          id: sessionId,
          deletedAt: null,
          OR: [
            {
              class: {
                deletedAt: null,
                students: {
                  some: {
                    studentId: authenticatedStudent.id,
                    deletedAt: null
                  }
                },
              },
            },
            { isAnonymous: true },
          ],
        },
        select: { id: true },
      });

      return session !== null;
    }

    return false;
  }

  async canUpdateSession(
    authenticatedUser: User,
    sessionId: number,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfSession(authenticatedUser, sessionId);
  }

  async canDeleteSession(
    authenticatedUser: User,
    sessionId: number,
  ): Promise<boolean> {
    return this.isAdminOrTeacherOfSession(authenticatedUser, sessionId);
  }

  async canListSolutions(
    authenticatedUser: User,
    sessionId: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
        class: { teacherId: authenticatedUser.id, deletedAt: null },
        deletedAt: null,
      },
      select: { id: true },
    });

    return authenticatedUser.type === UserType.TEACHER && session !== null;
  }

  async canListCurrentAnalyses(
    authenticatedUser: User,
    sessionId: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
        class: { teacherId: authenticatedUser.id, deletedAt: null },
        deletedAt: null,
      },
      select: { id: true },
    });

    return authenticatedUser.type === UserType.TEACHER && session !== null;
  }

  async canViewStudentSolution(
    authenticatedUser: User | null,
    authenticatedStudent: Student | null,
    studentSolutionId: number,
  ): Promise<boolean> {
    if (authenticatedUser === null && authenticatedStudent === null) {
      return false;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const solution = await this.prisma.studentSolution.findUniqueOrThrow({
      where: {
        id: studentSolutionId,
        deletedAt: null,
        session: {
          deletedAt: null,
          class: {
            deletedAt: null,
          },
        },
      },
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
      // students may only view solutions they submitted
      const solution = await this.prisma.solution.findUnique({
        select: {},
        where: {
          ...baseWhere,
          deletedAt: null,
          studentSolutions: {
            some: {
              student: { id: authenticatedStudent.id, deletedAt: null },
              deletedAt: null,
            },
          },
        },
      });

      return solution !== null;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.TEACHER) {
      // users may view solutions submitted by students in their class
      // and reference solutions.
      const solution = await this.prisma.solution.findUnique({
        select: {},
        where: {
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
                      teacher: { deletedAt: null },
                    },
                  },
                },
              },
            },
            {
              referenceSolutions: {
                some: {
                  deletedAt: null,
                  task: { deletedAt: null },
                },
              },
            },
          ],
        },
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
  ): Promise<boolean> {
    if (authenticatedUser === null) {
      return false;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    // teachers may updated the field for solutions submitted by students in their class
    const solution = await this.prisma.studentSolution.findUnique({
      select: {},
      where: {
        id: studentSolutionId,
        deletedAt: null,
        session: {
          deletedAt: null,
          class: {
            teacherId: authenticatedUser.id,
            deletedAt: null,
          },
        },
      },
    });

    return authenticatedUser.type === UserType.TEACHER && solution !== null;
  }
}
