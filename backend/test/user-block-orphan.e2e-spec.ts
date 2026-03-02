import { INestApplication } from "@nestjs/common";
import { TaskType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
  UsersService,
  UserOwnsClassesError,
} from "src/api/users/users.service";
import { getApp } from "./helpers/index";
import { createUser } from "./helpers/user";
import { createClassWithId } from "./helpers/class";
import { createTask } from "./helpers/task";

/**
 * E2E tests for User deletion BLOCK and ORPHAN behavior.
 * Tests verify SVC-01 (block if owns Classes) and SVC-02 (orphan Tasks).
 *
 * Note: These tests call UsersService.deleteById() which contains the BLOCK/ORPHAN
 * business logic. Direct prisma.user.delete() bypasses this logic (cascade-only).
 */
describe("User BLOCK/ORPHAN (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let usersService: UsersService;

  beforeEach(async () => {
    app = await getApp();
    prisma = app.get(PrismaService);
    usersService = app.get(UsersService);
  });

  afterEach(async () => {
    await app.close();
  });

  // =========================================================================
  // SVC-01: User deletion BLOCKED if user owns Classes
  // =========================================================================

  describe("SVC-01: User deletion blocked by owned Classes", () => {
    it("blocks deletion when user owns a Class", async () => {
      // Setup: User owns a Class
      const user = await createUser(app, { id: 80001 });
      await createClassWithId(app, { id: 80001, teacherId: user.id });

      // Attempt to delete User via service (not prisma directly)
      await expect(usersService.deleteById(user.id)).rejects.toThrow(
        UserOwnsClassesError,
      );

      // Verify User is NOT deleted
      const existingUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(existingUser).not.toBeNull();
      expect(existingUser!.deletedAt).toBeNull();
    });

    it("blocks deletion when user owns multiple Classes", async () => {
      // Setup: User owns multiple Classes
      const user = await createUser(app, { id: 80002 });
      await createClassWithId(app, { id: 80002, teacherId: user.id });
      await createClassWithId(app, { id: 80003, teacherId: user.id });

      // Attempt to delete User via service (not prisma directly)
      await expect(usersService.deleteById(user.id)).rejects.toThrow(
        UserOwnsClassesError,
      );

      // Verify User is NOT deleted
      const existingUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(existingUser).not.toBeNull();
    });

    it("allows deletion when user owned Class is already soft-deleted", async () => {
      // Setup: User owns a soft-deleted Class
      const user = await createUser(app, { id: 80003 });
      await createClassWithId(app, { id: 80004, teacherId: user.id });
      // Soft-delete the class first
      await prisma.class.delete({ where: { id: 80004 } });

      // Delete User via service should succeed (no active classes)
      await usersService.deleteById(user.id);

      // Verify User is soft-deleted
      const deletedUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(deletedUser).not.toBeNull();
      expect(deletedUser!.deletedAt).not.toBeNull();
    });

    it("allows deletion when user owns no Classes", async () => {
      // Setup: User with no Classes
      const user = await createUser(app, { id: 80004 });

      // Delete User via service should succeed
      await usersService.deleteById(user.id);

      // Verify User is soft-deleted
      const deletedUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      expect(deletedUser).not.toBeNull();
      expect(deletedUser!.deletedAt).not.toBeNull();
    });
  });

  // =========================================================================
  // SVC-02: User deletion handles Tasks based on visibility
  // - Private tasks (isPublic=false) are soft-deleted
  // - Public tasks (isPublic=true) are orphaned (creatorId=null)
  // =========================================================================

  describe("SVC-02: User deletion handles Tasks based on visibility", () => {
    it("soft-deletes private tasks when user is deleted", async () => {
      // Setup: User with private tasks (isPublic=false is default)
      const user = await createUser(app, { id: 80101 });
      const privateTask1 = await createTask(app, {
        id: 80101,
        creatorId: user.id,
        isPublic: false,
      });
      const privateTask2 = await createTask(app, {
        id: 80102,
        creatorId: user.id,
        isPublic: false,
      });

      // Verify tasks are private and have creatorId set
      expect(privateTask1.isPublic).toBe(false);
      expect(privateTask1.creatorId).toBe(user.id);
      expect(privateTask2.isPublic).toBe(false);
      expect(privateTask2.creatorId).toBe(user.id);

      // Delete User via service
      await usersService.deleteById(user.id);

      // Verify private tasks are soft-deleted
      const deletedTask1 = await prisma.task.findFirst({
        where: { id: privateTask1.id },
      });
      const deletedTask2 = await prisma.task.findFirst({
        where: { id: privateTask2.id },
      });

      expect(deletedTask1).not.toBeNull();
      expect(deletedTask1!.deletedAt).not.toBeNull();
      expect(deletedTask1!.creatorId).toBe(user.id); // creatorId preserved

      expect(deletedTask2).not.toBeNull();
      expect(deletedTask2!.deletedAt).not.toBeNull();
      expect(deletedTask2!.creatorId).toBe(user.id); // creatorId preserved
    });

    it("orphans public tasks when user is deleted", async () => {
      // Setup: User with public tasks
      const user = await createUser(app, { id: 80103 });
      const publicTask1 = await createTask(app, {
        id: 80103,
        creatorId: user.id,
        isPublic: true,
      });
      const publicTask2 = await createTask(app, {
        id: 80104,
        creatorId: user.id,
        isPublic: true,
      });

      // Verify tasks are public and have creatorId set
      expect(publicTask1.isPublic).toBe(true);
      expect(publicTask1.creatorId).toBe(user.id);
      expect(publicTask2.isPublic).toBe(true);
      expect(publicTask2.creatorId).toBe(user.id);

      // Delete User via service
      await usersService.deleteById(user.id);

      // Verify public tasks are orphaned (creatorId=null) but NOT deleted
      const orphanedTask1 = await prisma.task.findFirst({
        where: { id: publicTask1.id },
      });
      const orphanedTask2 = await prisma.task.findFirst({
        where: { id: publicTask2.id },
      });

      expect(orphanedTask1).not.toBeNull();
      expect(orphanedTask1!.creatorId).toBeNull();
      expect(orphanedTask1!.deletedAt).toBeNull(); // NOT deleted

      expect(orphanedTask2).not.toBeNull();
      expect(orphanedTask2!.creatorId).toBeNull();
      expect(orphanedTask2!.deletedAt).toBeNull(); // NOT deleted
    });

    it("handles mixed private and public tasks correctly", async () => {
      // Setup: User with both private and public tasks
      const user = await createUser(app, { id: 80105 });
      const privateTask = await createTask(app, {
        id: 80105,
        creatorId: user.id,
        isPublic: false,
      });
      const publicTask = await createTask(app, {
        id: 80106,
        creatorId: user.id,
        isPublic: true,
      });

      // Delete User via service
      await usersService.deleteById(user.id);

      // Verify private task is soft-deleted
      const deletedPrivateTask = await prisma.task.findFirst({
        where: { id: privateTask.id },
      });
      expect(deletedPrivateTask).not.toBeNull();
      expect(deletedPrivateTask!.deletedAt).not.toBeNull();
      expect(deletedPrivateTask!.creatorId).toBe(user.id);

      // Verify public task is orphaned but not deleted
      const orphanedPublicTask = await prisma.task.findFirst({
        where: { id: publicTask.id },
      });
      expect(orphanedPublicTask).not.toBeNull();
      expect(orphanedPublicTask!.creatorId).toBeNull();
      expect(orphanedPublicTask!.deletedAt).toBeNull();
    });

    it("preserves public task data after orphaning", async () => {
      // Setup: User with public task
      const user = await createUser(app, { id: 80107 });
      const task = await createTask(app, {
        id: 80107,
        creatorId: user.id,
        isPublic: true,
      });

      // Delete User via service
      await usersService.deleteById(user.id);

      // Verify Task data is preserved
      const orphanedTask = await prisma.task.findFirst({
        where: { id: task.id },
      });
      expect(orphanedTask).not.toBeNull();
      expect(orphanedTask!.title).toBe("Test Task 80107");
      expect(orphanedTask!.description).toBe("Test description");
      expect(orphanedTask!.type).toBe(TaskType.SCRATCH);
      expect(orphanedTask!.isPublic).toBe(true);
    });

    it("does not affect other users' Tasks", async () => {
      // Setup: Two users with tasks
      const user1 = await createUser(app, { id: 80108 });
      const user2 = await createUser(app, { id: 80109 });
      const privateTask1 = await createTask(app, {
        id: 80108,
        creatorId: user1.id,
        isPublic: false,
      });
      const publicTask1 = await createTask(app, {
        id: 80109,
        creatorId: user1.id,
        isPublic: true,
      });
      const privateTask2 = await createTask(app, {
        id: 80110,
        creatorId: user2.id,
        isPublic: false,
      });
      const publicTask2 = await createTask(app, {
        id: 80111,
        creatorId: user2.id,
        isPublic: true,
      });

      // Delete User1 via service
      await usersService.deleteById(user1.id);

      // Verify User1's private task is soft-deleted
      const deletedTask = await prisma.task.findFirst({
        where: { id: privateTask1.id },
      });
      expect(deletedTask!.deletedAt).not.toBeNull();

      // Verify User1's public task is orphaned
      const orphanedTask = await prisma.task.findFirst({
        where: { id: publicTask1.id },
      });
      expect(orphanedTask!.creatorId).toBeNull();

      // Verify User2's tasks are NOT affected
      const unaffectedPrivate = await prisma.task.findFirst({
        where: { id: privateTask2.id },
      });
      const unaffectedPublic = await prisma.task.findFirst({
        where: { id: publicTask2.id },
      });
      expect(unaffectedPrivate!.creatorId).toBe(user2.id);
      expect(unaffectedPrivate!.deletedAt).toBeNull();
      expect(unaffectedPublic!.creatorId).toBe(user2.id);
      expect(unaffectedPublic!.deletedAt).toBeNull();
    });
  });

  // =========================================================================
  // Combined scenarios
  // =========================================================================

  describe("Combined BLOCK and task handling scenarios", () => {
    it("blocks deletion and does NOT modify tasks when user owns Classes", async () => {
      // Setup: User with Classes and both private and public tasks
      const user = await createUser(app, { id: 80201 });
      await createClassWithId(app, { id: 80201, teacherId: user.id });
      const privateTask = await createTask(app, {
        id: 80201,
        creatorId: user.id,
        isPublic: false,
      });
      const publicTask = await createTask(app, {
        id: 80202,
        creatorId: user.id,
        isPublic: true,
      });

      // Attempt to delete User via service (should fail due to BLOCK)
      await expect(usersService.deleteById(user.id)).rejects.toThrow(
        UserOwnsClassesError,
      );

      // Verify private task is NOT soft-deleted (transaction rolled back)
      const unchangedPrivateTask = await prisma.task.findFirst({
        where: { id: privateTask.id },
      });
      expect(unchangedPrivateTask!.creatorId).toBe(user.id);
      expect(unchangedPrivateTask!.deletedAt).toBeNull();

      // Verify public task is NOT orphaned (transaction rolled back)
      const unchangedPublicTask = await prisma.task.findFirst({
        where: { id: publicTask.id },
      });
      expect(unchangedPublicTask!.creatorId).toBe(user.id);
    });

    it("handles tasks and deletes user atomically", async () => {
      // Setup: User with private and public tasks but no Classes
      const user = await createUser(app, { id: 80203 });
      const privateTask = await createTask(app, {
        id: 80203,
        creatorId: user.id,
        isPublic: false,
      });
      const publicTask = await createTask(app, {
        id: 80204,
        creatorId: user.id,
        isPublic: true,
      });

      // Delete User via service
      await usersService.deleteById(user.id);

      // All operations should have completed atomically
      const deletedUser = await prisma.user.findFirst({
        where: { id: user.id },
      });
      const deletedPrivateTask = await prisma.task.findFirst({
        where: { id: privateTask.id },
      });
      const orphanedPublicTask = await prisma.task.findFirst({
        where: { id: publicTask.id },
      });

      expect(deletedUser!.deletedAt).not.toBeNull();
      expect(deletedPrivateTask!.deletedAt).not.toBeNull();
      expect(orphanedPublicTask!.creatorId).toBeNull();
      expect(orphanedPublicTask!.deletedAt).toBeNull();
    });
  });
});
