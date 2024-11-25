import { Injectable } from "@nestjs/common";
import { Student, User, UserType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  protected async isUserTeacherOfClass(
    userId: number,
    classId: number,
  ): Promise<boolean> {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId, teacherId: userId },
      select: { id: true },
    });

    return klass !== null;
  }

  canSignInStudent(teacher: User, classId: number): Promise<boolean> {
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
      authenticatedUser.id === userId ||
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
      where: { id: taskId, creatorId: authenticatedUser.id },
      select: { id: true },
    });

    return task !== null;
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
    return teacherId !== undefined && authenticatedUser.id === teacherId;
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
      where: { id: sessionId, class: { teacherId: authenticatedUser.id } },
      select: { id: true },
    });

    return session !== null;
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
          class: { students: { some: { id: authenticatedStudent.id } } },
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
      where: { id: sessionId, class: { teacherId: authenticatedUser.id } },
      select: { id: true },
    });

    return session !== null;
  }

  async canListCurrentAnalyses(
    authenticatedUser: User,
    sessionId: number,
  ): Promise<boolean> {
    if (authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId, class: { teacherId: authenticatedUser.id } },
      select: { id: true },
    });

    return session !== null;
  }

  async canViewSolution(
    authenticatedUser: User | null,
    authenticatedStudent: Student | null,
    solutionId: number,
  ): Promise<boolean> {
    if (authenticatedUser === null && authenticatedStudent === null) {
      return false;
    }

    if (authenticatedUser && authenticatedUser.type === UserType.ADMIN) {
      return true;
    }

    const solution = await this.prisma.solution.findUniqueOrThrow({
      where: { id: solutionId },
      include: {
        student: { select: { id: true } },
        session: { select: { class: { select: { teacherId: true } } } },
      },
    });

    if (authenticatedStudent) {
      // if we submitted the solution, we can view it
      return solution.student.id === authenticatedStudent.id;
    }

    if (authenticatedUser) {
      // if we are the teacher of the class, we can view the solution
      return solution.session.class.teacherId === authenticatedUser.id;
    }

    // this line is not reachable but typescript doesn't know that
    // the first guard ensures that either authenticatedUser or authenticatedStudent is not null
    return false;
  }
}
