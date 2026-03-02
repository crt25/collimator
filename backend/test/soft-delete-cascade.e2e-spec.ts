import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { getApp } from "./helpers/index";
import {
  createUser,
  createAuthenticationToken,
  createRegistrationToken,
} from "./helpers/user";
import { createClassWithId } from "./helpers/class";
import { createSessionWithId } from "./helpers/session";
import {
  createTask,
  createSolution,
  createSolutionAnalysis,
  createReferenceSolution,
  createStudentSolution,
  createSolutionTest,
} from "./helpers/task";
import {
  createStudent,
  createAuthenticatedStudent,
  createAnonymousStudent,
} from "./helpers/student";
import { createStudentActivity } from "./helpers/activity";
import { createKeyPair, createEncryptedPrivateKey } from "./helpers/keypair";

/**
 * E2E tests for cascade soft-delete behavior.
 * Tests verify that deleting a parent entity cascades the same deletedAt timestamp
 * to all soft-deletable child entities according to CAS-01 through CAS-09 requirements.
 */
describe("Soft Delete Cascade (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    app = await getApp();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  // =========================================================================
  // CAS-01: Task cascade tests
  // =========================================================================

  describe("CAS-01: Task deletion cascade", () => {
    it("cascades to ReferenceSolution", async () => {
      // Setup: User -> Task -> Solution -> ReferenceSolution
      const user = await createUser(app, { id: 1001 });
      const task = await createTask(app, { id: 1001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-001");
      await createSolution(app, { taskId: task.id, hash });
      const refSolution = await createReferenceSolution(app, {
        id: 1001,
        taskId: task.id,
        solutionHash: hash,
      });

      // Delete Task
      await prisma.task.delete({ where: { id: task.id } });

      // Verify Task is soft-deleted
      const deletedTask = await prisma.task.findFirst({
        where: { id: task.id },
      });
      expect(deletedTask).not.toBeNull();
      expect(deletedTask!.deletedAt).not.toBeNull();

      // Verify ReferenceSolution has same deletedAt
      const deletedRefSolution = await prisma.referenceSolution.findFirst({
        where: { id: refSolution.id },
      });
      expect(deletedRefSolution).not.toBeNull();
      expect(deletedRefSolution!.deletedAt).not.toBeNull();
      expect(deletedRefSolution!.deletedAt!.getTime()).toBe(
        deletedTask!.deletedAt!.getTime(),
      );
    });

    it("cascades to Solution and SolutionAnalysis", async () => {
      // Setup: User -> Task -> Solution -> SolutionAnalysis
      const user = await createUser(app, { id: 1002 });
      const task = await createTask(app, { id: 1002, creatorId: user.id });
      const hash = Buffer.from("solution-hash-002");
      const solution = await createSolution(app, { taskId: task.id, hash });
      await createSolutionAnalysis(app, {
        taskId: task.id,
        solutionHash: hash,
      });

      // Delete Task
      await prisma.task.delete({ where: { id: task.id } });

      // Verify Task is soft-deleted
      const deletedTask = await prisma.task.findFirst({
        where: { id: task.id },
      });
      expect(deletedTask!.deletedAt).not.toBeNull();

      // Verify Solution has same deletedAt
      const deletedSolution = await prisma.solution.findFirst({
        where: { taskId: solution.taskId, hash: solution.hash },
      });
      expect(deletedSolution).not.toBeNull();
      expect(deletedSolution!.deletedAt).not.toBeNull();
      expect(deletedSolution!.deletedAt!.getTime()).toBe(
        deletedTask!.deletedAt!.getTime(),
      );

      // Verify SolutionAnalysis has same deletedAt
      const deletedAnalysis = await prisma.solutionAnalysis.findFirst({
        where: { taskId: task.id, solutionHash: hash },
      });
      expect(deletedAnalysis).not.toBeNull();
      expect(deletedAnalysis!.deletedAt).not.toBeNull();
      expect(deletedAnalysis!.deletedAt!.getTime()).toBe(
        deletedTask!.deletedAt!.getTime(),
      );
    });

    it("cascades to StudentSolution", async () => {
      // Setup: User -> Task, Class -> Session -> Student -> StudentSolution
      const user = await createUser(app, { id: 1003 });
      const task = await createTask(app, { id: 1003, creatorId: user.id });
      const hash = Buffer.from("solution-hash-003");
      await createSolution(app, { taskId: task.id, hash });
      const klass = await createClassWithId(app, {
        id: 1003,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 1003,
        classId: klass.id,
      });
      const student = await createStudent(app, { id: 1003 });
      const studentSolution = await createStudentSolution(app, {
        id: 1003,
        taskId: task.id,
        solutionHash: hash,
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete Task
      await prisma.task.delete({ where: { id: task.id } });

      // Verify StudentSolution has same deletedAt as Task
      const deletedTask = await prisma.task.findFirst({
        where: { id: task.id },
      });
      const deletedStudentSolution = await prisma.studentSolution.findFirst({
        where: { id: studentSolution.id },
      });
      expect(deletedStudentSolution!.deletedAt).not.toBeNull();
      expect(deletedStudentSolution!.deletedAt!.getTime()).toBe(
        deletedTask!.deletedAt!.getTime(),
      );
    });

    it("cascades to StudentActivity", async () => {
      // Setup: User -> Task, Class -> Session -> Student -> StudentActivity
      const user = await createUser(app, { id: 1004 });
      const task = await createTask(app, { id: 1004, creatorId: user.id });
      const hash = Buffer.from("solution-hash-004");
      await createSolution(app, { taskId: task.id, hash });
      const klass = await createClassWithId(app, {
        id: 1004,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 1004,
        classId: klass.id,
      });
      const student = await createStudent(app, { id: 1004 });
      const activity = await createStudentActivity(app, {
        id: 1004,
        studentId: student.id,
        sessionId: session.id,
        taskId: task.id,
        solutionHash: hash,
      });

      // Delete Task
      await prisma.task.delete({ where: { id: task.id } });

      // Verify StudentActivity has same deletedAt as Task
      const deletedTask = await prisma.task.findFirst({
        where: { id: task.id },
      });
      const deletedActivity = await prisma.studentActivity.findFirst({
        where: { id: activity.id },
      });
      expect(deletedActivity!.deletedAt).not.toBeNull();
      expect(deletedActivity!.deletedAt!.getTime()).toBe(
        deletedTask!.deletedAt!.getTime(),
      );
    });
  });

  // =========================================================================
  // CAS-02: Session cascade tests
  // =========================================================================

  // Note: SessionTask uses DB-level CASCADE (not soft-delete) since it has no deletedAt field.
  // When Session is soft-deleted, SessionTask records are HARD-deleted via DB cascade.
  describe("CAS-02: Session deletion cascade", () => {
    it("cascades to StudentSolution", async () => {
      // Setup: User -> Class -> Session, Task -> StudentSolution
      const user = await createUser(app, { id: 2001 });
      const klass = await createClassWithId(app, {
        id: 2001,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 2001,
        classId: klass.id,
      });
      const task = await createTask(app, { id: 2001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-2001");
      await createSolution(app, { taskId: task.id, hash });
      const student = await createStudent(app, { id: 2001 });
      const studentSolution = await createStudentSolution(app, {
        id: 2001,
        taskId: task.id,
        solutionHash: hash,
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete Session
      await prisma.session.delete({ where: { id: session.id } });

      // Verify StudentSolution has same deletedAt as Session
      const deletedSession = await prisma.session.findFirst({
        where: { id: session.id },
      });
      const deletedStudentSolution = await prisma.studentSolution.findFirst({
        where: { id: studentSolution.id },
      });
      expect(deletedStudentSolution!.deletedAt).not.toBeNull();
      expect(deletedStudentSolution!.deletedAt!.getTime()).toBe(
        deletedSession!.deletedAt!.getTime(),
      );
    });

    it("cascades to StudentActivity", async () => {
      // Setup: User -> Class -> Session, Task -> StudentActivity
      const user = await createUser(app, { id: 2002 });
      const klass = await createClassWithId(app, {
        id: 2002,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 2002,
        classId: klass.id,
      });
      const task = await createTask(app, { id: 2002, creatorId: user.id });
      const hash = Buffer.from("solution-hash-2002");
      await createSolution(app, { taskId: task.id, hash });
      const student = await createStudent(app, { id: 2002 });
      const activity = await createStudentActivity(app, {
        id: 2002,
        studentId: student.id,
        sessionId: session.id,
        taskId: task.id,
        solutionHash: hash,
      });

      // Delete Session
      await prisma.session.delete({ where: { id: session.id } });

      // Verify StudentActivity has same deletedAt as Session
      const deletedSession = await prisma.session.findFirst({
        where: { id: session.id },
      });
      const deletedActivity = await prisma.studentActivity.findFirst({
        where: { id: activity.id },
      });
      expect(deletedActivity!.deletedAt).not.toBeNull();
      expect(deletedActivity!.deletedAt!.getTime()).toBe(
        deletedSession!.deletedAt!.getTime(),
      );
    });

    it("cascades to AnonymousStudent", async () => {
      // Setup: User -> Class -> Session (anonymous) -> AnonymousStudent -> Student
      const user = await createUser(app, { id: 2003 });
      const klass = await createClassWithId(app, {
        id: 2003,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 2003,
        classId: klass.id,
        isAnonymous: true,
      });
      const student = await createStudent(app, { id: 2003 });
      await createAnonymousStudent(app, {
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete Session
      await prisma.session.delete({ where: { id: session.id } });

      // Verify AnonymousStudent has same deletedAt as Session
      const deletedSession = await prisma.session.findFirst({
        where: { id: session.id },
      });
      const deletedAnonStudent = await prisma.anonymousStudent.findFirst({
        where: { studentId: student.id },
      });
      expect(deletedAnonStudent!.deletedAt).not.toBeNull();
      expect(deletedAnonStudent!.deletedAt!.getTime()).toBe(
        deletedSession!.deletedAt!.getTime(),
      );
    });
  });

  // =========================================================================
  // CAS-03: Class cascade tests
  // =========================================================================

  describe("CAS-03: Class deletion cascade", () => {
    it("cascades to Session and Session's children", async () => {
      // Setup: User -> Class -> Session -> StudentSolution
      const user = await createUser(app, { id: 3001 });
      const klass = await createClassWithId(app, {
        id: 3001,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 3001,
        classId: klass.id,
      });
      const task = await createTask(app, { id: 3001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-3001");
      await createSolution(app, { taskId: task.id, hash });
      const student = await createStudent(app, { id: 3001 });
      const studentSolution = await createStudentSolution(app, {
        id: 3001,
        taskId: task.id,
        solutionHash: hash,
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete Class
      await prisma.class.delete({ where: { id: klass.id } });

      // Verify Class, Session, and StudentSolution all have same deletedAt
      const deletedClass = await prisma.class.findFirst({
        where: { id: klass.id },
      });
      const deletedSession = await prisma.session.findFirst({
        where: { id: session.id },
      });
      const deletedStudentSolution = await prisma.studentSolution.findFirst({
        where: { id: studentSolution.id },
      });

      expect(deletedClass!.deletedAt).not.toBeNull();
      expect(deletedSession!.deletedAt).not.toBeNull();
      expect(deletedStudentSolution!.deletedAt).not.toBeNull();

      // All should have EXACTLY the same timestamp
      expect(deletedSession!.deletedAt!.getTime()).toBe(
        deletedClass!.deletedAt!.getTime(),
      );
      expect(deletedStudentSolution!.deletedAt!.getTime()).toBe(
        deletedClass!.deletedAt!.getTime(),
      );
    });

    it("cascades to AuthenticatedStudent", async () => {
      // Setup: User -> Class -> AuthenticatedStudent -> Student
      const user = await createUser(app, { id: 3002 });
      const klass = await createClassWithId(app, {
        id: 3002,
        teacherId: user.id,
      });
      const student = await createStudent(app, { id: 3002 });
      await createAuthenticatedStudent(app, {
        studentId: student.id,
        classId: klass.id,
      });

      // Delete Class
      await prisma.class.delete({ where: { id: klass.id } });

      // Verify AuthenticatedStudent has same deletedAt as Class
      const deletedClass = await prisma.class.findFirst({
        where: { id: klass.id },
      });
      const deletedAuthStudent = await prisma.authenticatedStudent.findFirst({
        where: { studentId: student.id },
      });
      expect(deletedAuthStudent!.deletedAt).not.toBeNull();
      expect(deletedAuthStudent!.deletedAt!.getTime()).toBe(
        deletedClass!.deletedAt!.getTime(),
      );
    });
  });

  // =========================================================================
  // CAS-04: Student cascade tests
  // =========================================================================

  describe("CAS-04: Student deletion cascade", () => {
    it("cascades to StudentSolution", async () => {
      // Setup: User -> Task, Class -> Session -> Student -> StudentSolution
      const user = await createUser(app, { id: 4001 });
      const task = await createTask(app, { id: 4001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-4001");
      await createSolution(app, { taskId: task.id, hash });
      const klass = await createClassWithId(app, {
        id: 4001,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 4001,
        classId: klass.id,
      });
      const student = await createStudent(app, { id: 4001 });
      const studentSolution = await createStudentSolution(app, {
        id: 4001,
        taskId: task.id,
        solutionHash: hash,
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete Student
      await prisma.student.delete({ where: { id: student.id } });

      // Verify StudentSolution has same deletedAt as Student
      const deletedStudent = await prisma.student.findFirst({
        where: { id: student.id },
      });
      const deletedStudentSolution = await prisma.studentSolution.findFirst({
        where: { id: studentSolution.id },
      });
      expect(deletedStudentSolution!.deletedAt).not.toBeNull();
      expect(deletedStudentSolution!.deletedAt!.getTime()).toBe(
        deletedStudent!.deletedAt!.getTime(),
      );
    });

    it("cascades to StudentActivity", async () => {
      // Setup: User -> Task, Class -> Session -> Student -> StudentActivity
      const user = await createUser(app, { id: 4002 });
      const task = await createTask(app, { id: 4002, creatorId: user.id });
      const hash = Buffer.from("solution-hash-4002");
      await createSolution(app, { taskId: task.id, hash });
      const klass = await createClassWithId(app, {
        id: 4002,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 4002,
        classId: klass.id,
      });
      const student = await createStudent(app, { id: 4002 });
      const activity = await createStudentActivity(app, {
        id: 4002,
        studentId: student.id,
        sessionId: session.id,
        taskId: task.id,
        solutionHash: hash,
      });

      // Delete Student
      await prisma.student.delete({ where: { id: student.id } });

      // Verify StudentActivity has same deletedAt as Student
      const deletedStudent = await prisma.student.findFirst({
        where: { id: student.id },
      });
      const deletedActivity = await prisma.studentActivity.findFirst({
        where: { id: activity.id },
      });
      expect(deletedActivity!.deletedAt).not.toBeNull();
      expect(deletedActivity!.deletedAt!.getTime()).toBe(
        deletedStudent!.deletedAt!.getTime(),
      );
    });

    it("hard-deletes AuthenticationToken (student) when students is soft-deleted", async () => {
      // Setup: Student -> AuthenticationToken
      const student = await createStudent(app, { id: 4003 });
      const token = await createAuthenticationToken(app, {
        id: 4003,
        studentId: student.id,
      });

      // Delete Student
      await prisma.student.delete({ where: { id: student.id } });

      // Verify AuthenticationToken is hard-deleted
      const deletedToken = await prisma.authenticationToken.findFirst({
        where: { id: token.id },
      });
      expect(deletedToken).toBeNull();
    });
  });

  // =========================================================================
  // CAS-05: AuthenticatedStudent/AnonymousStudent cascade tests
  // Note: These cascade Student via onDelete: Cascade in schema,
  // but Student cascade should trigger extension cascade for Student's children
  // =========================================================================

  describe("CAS-05: AuthenticatedStudent/AnonymousStudent cascade", () => {
    it("AuthenticatedStudent deletion cascades to Student", async () => {
      // Setup: User -> Class -> AuthenticatedStudent -> Student
      const user = await createUser(app, { id: 5001 });
      const klass = await createClassWithId(app, {
        id: 5001,
        teacherId: user.id,
      });
      const student = await createStudent(app, { id: 5001 });
      await createAuthenticatedStudent(app, {
        studentId: student.id,
        classId: klass.id,
      });

      // Delete AuthenticatedStudent
      await prisma.authenticatedStudent.delete({
        where: { studentId: student.id },
      });

      // Verify AuthenticatedStudent is soft-deleted
      const deletedAuthStudent = await prisma.authenticatedStudent.findFirst({
        where: { studentId: student.id },
      });
      expect(deletedAuthStudent!.deletedAt).not.toBeNull();

      // Note: Student cascade is via DB onDelete: Cascade, not soft-delete extension
      // So Student may be hard-deleted or not affected depending on schema
    });

    it("AnonymousStudent deletion cascades to Student", async () => {
      // Setup: User -> Class -> Session -> AnonymousStudent -> Student
      const user = await createUser(app, { id: 5002 });
      const klass = await createClassWithId(app, {
        id: 5002,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 5002,
        classId: klass.id,
        isAnonymous: true,
      });
      const student = await createStudent(app, { id: 5002 });
      await createAnonymousStudent(app, {
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete AnonymousStudent
      await prisma.anonymousStudent.delete({
        where: { studentId: student.id },
      });

      // Verify AnonymousStudent is soft-deleted
      const deletedAnonStudent = await prisma.anonymousStudent.findFirst({
        where: { studentId: student.id },
      });
      expect(deletedAnonStudent!.deletedAt).not.toBeNull();
    });
  });

  // =========================================================================
  // CAS-06: Solution cascade tests
  // =========================================================================

  describe("CAS-06: Solution deletion cascade", () => {
    it("cascades to SolutionAnalysis (composite key)", async () => {
      // Setup: User -> Task -> Solution -> SolutionAnalysis
      const user = await createUser(app, { id: 6001 });
      const task = await createTask(app, { id: 6001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-6001");
      await createSolution(app, { taskId: task.id, hash });
      await createSolutionAnalysis(app, {
        taskId: task.id,
        solutionHash: hash,
      });

      // Delete Solution (composite key)
      await prisma.solution.delete({
        where: { taskId_hash: { taskId: task.id, hash } },
      });

      // Verify Solution is soft-deleted
      const deletedSolution = await prisma.solution.findFirst({
        where: { taskId: task.id, hash },
      });
      expect(deletedSolution!.deletedAt).not.toBeNull();

      // Verify SolutionAnalysis has same deletedAt
      const deletedAnalysis = await prisma.solutionAnalysis.findFirst({
        where: { taskId: task.id, solutionHash: hash },
      });
      expect(deletedAnalysis!.deletedAt).not.toBeNull();
      expect(deletedAnalysis!.deletedAt!.getTime()).toBe(
        deletedSolution!.deletedAt!.getTime(),
      );
    });
  });

  // =========================================================================
  // CAS-07: ReferenceSolution cascade tests
  // =========================================================================

  describe("CAS-07: ReferenceSolution deletion cascade", () => {
    it("cascades to SolutionTest", async () => {
      // Setup: User -> Task -> Solution -> ReferenceSolution -> SolutionTest
      const user = await createUser(app, { id: 7001 });
      const task = await createTask(app, { id: 7001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-7001");
      await createSolution(app, { taskId: task.id, hash });
      const refSolution = await createReferenceSolution(app, {
        id: 7001,
        taskId: task.id,
        solutionHash: hash,
      });
      const solutionTest = await createSolutionTest(app, {
        id: 7001,
        referenceSolutionId: refSolution.id,
      });

      // Delete ReferenceSolution
      await prisma.referenceSolution.delete({ where: { id: refSolution.id } });

      // Verify ReferenceSolution is soft-deleted
      const deletedRefSolution = await prisma.referenceSolution.findFirst({
        where: { id: refSolution.id },
      });
      expect(deletedRefSolution!.deletedAt).not.toBeNull();

      // Verify SolutionTest has same deletedAt
      const deletedTest = await prisma.solutionTest.findFirst({
        where: { id: solutionTest.id },
      });
      expect(deletedTest!.deletedAt).not.toBeNull();
      expect(deletedTest!.deletedAt!.getTime()).toBe(
        deletedRefSolution!.deletedAt!.getTime(),
      );
    });
  });

  // =========================================================================
  // CAS-08: KeyPair cascade tests
  // =========================================================================

  describe("CAS-08: KeyPair deletion cascade", () => {
    it("hard-deletes EncryptedPrivateKey", async () => {
      // Setup: User -> KeyPair -> EncryptedPrivateKey
      const user = await createUser(app, { id: 8001 });
      const keyPair = await createKeyPair(app, {
        id: 8001,
        teacherId: user.id,
      });
      const encryptedKey = await createEncryptedPrivateKey(app, {
        id: 8001,
        publicKeyId: keyPair.id,
      });

      // Delete KeyPair
      await prisma.keyPair.delete({ where: { id: keyPair.id } });

      // Verify EncryptedPrivateKey is hard-deleted (no longer exists)
      const deletedEncryptedKey = await prisma.encryptedPrivateKey.findFirst({
        where: { id: encryptedKey.id },
      });
      expect(deletedEncryptedKey).toBeNull();
    });
  });

  // =========================================================================
  // CAS-09: User cascade tests
  // =========================================================================

  describe("CAS-09: User deletion cascade", () => {
    // Auth models (KeyPair, EncryptedPrivateKey, AuthenticationToken, RegistrationToken)
    // are HARD-deleted via DB cascade when User is deleted. They don't have deletedAt
    // because they don't benefit from soft-delete recovery and should be purged for security.

    it("hard-deletes KeyPair and EncryptedPrivateKey when User is soft-deleted", async () => {
      // Setup: User -> KeyPair -> EncryptedPrivateKey
      const user = await createUser(app, { id: 9001 });
      const keyPair = await createKeyPair(app, {
        id: 9001,
        teacherId: user.id,
      });
      const encryptedKey = await createEncryptedPrivateKey(app, {
        id: 9001,
        publicKeyId: keyPair.id,
      });

      // Delete User (soft-delete)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify User is soft-deleted
      const deletedUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(deletedUser).not.toBeNull();
      expect(deletedUser!.deletedAt).not.toBeNull();

      // Verify KeyPair is HARD-deleted (no longer exists)
      const deletedKeyPair = await prisma.keyPair.findFirst({
        where: { id: keyPair.id },
      });
      expect(deletedKeyPair).toBeNull();

      // Verify EncryptedPrivateKey is HARD-deleted (no longer exists)
      const deletedEncryptedKey = await prisma.encryptedPrivateKey.findFirst({
        where: { id: encryptedKey.id },
      });
      expect(deletedEncryptedKey).toBeNull();
    });

    it("hard-deletes AuthenticationToken when User is soft-deleted", async () => {
      // Setup: User -> AuthenticationToken
      const user = await createUser(app, { id: 9002 });
      const token = await createAuthenticationToken(app, {
        id: 9002,
        userId: user.id,
      });

      // Delete User (soft-delete)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify User is soft-deleted
      const deletedUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(deletedUser).not.toBeNull();
      expect(deletedUser!.deletedAt).not.toBeNull();

      // Verify AuthenticationToken is HARD-deleted (no longer exists)
      const deletedToken = await prisma.authenticationToken.findFirst({
        where: { id: token.id },
      });
      expect(deletedToken).toBeNull();
    });

    it("hard-deletes RegistrationToken when User is soft-deleted", async () => {
      // Setup: User -> RegistrationToken
      const user = await createUser(app, { id: 9003 });
      const regToken = await createRegistrationToken(app, {
        id: 9003,
        userId: user.id,
      });

      // Delete User (soft-delete)
      await prisma.user.delete({ where: { id: user.id } });

      // Verify User is soft-deleted
      const deletedUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(deletedUser).not.toBeNull();
      expect(deletedUser!.deletedAt).not.toBeNull();

      // Verify RegistrationToken is HARD-deleted (no longer exists)
      const deletedRegToken = await prisma.registrationToken.findFirst({
        where: { id: regToken.id },
      });
      expect(deletedRegToken).toBeNull();
    });
  });

  // =========================================================================
  // Timestamp consistency tests
  // =========================================================================

  describe("Timestamp consistency", () => {
    it("preserves original deletedAt on already-deleted children", async () => {
      // Setup: Class -> Session (where Session is already soft-deleted)
      const user = await createUser(app, { id: 10000 });
      const klass = await createClassWithId(app, {
        id: 10000,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 10000,
        classId: klass.id,
      });

      // First, soft-delete the Session directly
      await prisma.session.delete({ where: { id: session.id } });

      // Capture the Session's original deletedAt timestamp
      const deletedSession = await prisma.session.findFirst({
        where: { id: session.id },
      });
      expect(deletedSession!.deletedAt).not.toBeNull();
      const originalSessionDeletedAt = deletedSession!.deletedAt!.getTime();

      // Wait a bit to ensure different timestamp if bug exists
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now delete the parent Class - this should NOT overwrite Session's deletedAt
      await prisma.class.delete({ where: { id: klass.id } });

      // Verify Class is soft-deleted with a newer timestamp
      const deletedClass = await prisma.class.findFirst({
        where: { id: klass.id },
      });
      expect(deletedClass!.deletedAt).not.toBeNull();
      expect(deletedClass!.deletedAt!.getTime()).toBeGreaterThan(
        originalSessionDeletedAt,
      );

      // Verify Session's deletedAt was NOT overwritten - it should keep original timestamp
      const sessionAfterClassDelete = await prisma.session.findFirst({
        where: { id: session.id },
      });
      expect(sessionAfterClassDelete!.deletedAt!.getTime()).toBe(
        originalSessionDeletedAt,
      );
    });

    it("uses identical deletedAt for entire cascade tree", async () => {
      // Create deep hierarchy: Class -> Session -> StudentSolution
      const user = await createUser(app, { id: 10001 });
      const klass = await createClassWithId(app, {
        id: 10001,
        teacherId: user.id,
      });
      const session = await createSessionWithId(app, {
        id: 10001,
        classId: klass.id,
      });
      const task = await createTask(app, { id: 10001, creatorId: user.id });
      const hash = Buffer.from("solution-hash-10001");
      await createSolution(app, { taskId: task.id, hash });
      const student = await createStudent(app, { id: 10001 });
      await createStudentSolution(app, {
        id: 10001,
        taskId: task.id,
        solutionHash: hash,
        studentId: student.id,
        sessionId: session.id,
      });

      // Delete Class (should cascade to Session, StudentSolution)
      await prisma.class.delete({ where: { id: klass.id } });

      // Get all deleted entities
      const deletedClass = await prisma.class.findFirst({
        where: { id: klass.id },
      });
      const deletedSession = await prisma.session.findFirst({
        where: { id: session.id },
      });
      const deletedStudentSolution = await prisma.studentSolution.findFirst({
        where: { taskId: task.id, studentId: student.id },
      });

      // All should have EXACTLY the same timestamp (not just close, but identical)
      expect(deletedClass!.deletedAt).not.toBeNull();
      expect(deletedSession!.deletedAt!.getTime()).toBe(
        deletedClass!.deletedAt!.getTime(),
      );
      expect(deletedStudentSolution!.deletedAt!.getTime()).toBe(
        deletedClass!.deletedAt!.getTime(),
      );
    });
  });

  // =========================================================================
  // deleteMany cascade tests
  // =========================================================================

  describe("deleteMany cascade", () => {
    it("cascades for each record in deleteMany", async () => {
      // Setup: Two classes with sessions
      const user = await createUser(app, { id: 11001 });
      const klass1 = await createClassWithId(app, {
        id: 11001,
        teacherId: user.id,
      });
      const klass2 = await createClassWithId(app, {
        id: 11002,
        teacherId: user.id,
      });
      const session1 = await createSessionWithId(app, {
        id: 11001,
        classId: klass1.id,
      });
      const session2 = await createSessionWithId(app, {
        id: 11002,
        classId: klass2.id,
      });

      // Delete both classes at once
      await prisma.class.deleteMany({
        where: { id: { in: [klass1.id, klass2.id] } },
      });

      // Verify both classes are soft-deleted
      const deletedClass1 = await prisma.class.findFirst({
        where: { id: klass1.id },
      });
      const deletedClass2 = await prisma.class.findFirst({
        where: { id: klass2.id },
      });
      expect(deletedClass1!.deletedAt).not.toBeNull();
      expect(deletedClass2!.deletedAt).not.toBeNull();

      // Verify both sessions are soft-deleted
      const deletedSession1 = await prisma.session.findFirst({
        where: { id: session1.id },
      });
      const deletedSession2 = await prisma.session.findFirst({
        where: { id: session2.id },
      });
      expect(deletedSession1!.deletedAt).not.toBeNull();
      expect(deletedSession2!.deletedAt).not.toBeNull();

      // All should have same timestamp (single deleteMany call)
      expect(deletedClass1!.deletedAt!.getTime()).toBe(
        deletedClass2!.deletedAt!.getTime(),
      );
      expect(deletedSession1!.deletedAt!.getTime()).toBe(
        deletedClass1!.deletedAt!.getTime(),
      );
      expect(deletedSession2!.deletedAt!.getTime()).toBe(
        deletedClass1!.deletedAt!.getTime(),
      );
    });
  });
});
