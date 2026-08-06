import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { PrismaService } from "src/prisma/prisma.service";
import { defaultAdmin, defaultTeacher } from "test/seed";
import { adminUserToken, ensureUserExists } from "./helpers/user";
import { getApp } from "./helpers/index";
import { createClassWithId } from "./helpers/class";
import { createSessionWithId } from "./helpers/session";
import {
  createAnonymousStudent,
  createAuthenticatedStudent,
  createStudent,
} from "./helpers/student";

jest.mock("src/api/authentication/helpers.ts", () => ({
  ...jest.requireActual("src/api/authentication/helpers.ts"),
  getTokenFromExecutionContext: jest.fn(() => adminUserToken),
}));

// Anonymous students joining a lesson are recorded (AnonymousStudent), but the
// teacher's progress view derived its participant list from solutions and
// analyses alone, so a student who joined without starting a task was
// invisible (CRT-454). The lesson detail now exposes the joined anonymous
// participants so the view can list them immediately.
describe("Session anonymous participants (e2e)", () => {
  let app: INestApplication;

  const classId = 2201;
  const sessionId = 2401;

  beforeEach(async () => {
    app = await getApp();

    await ensureUserExists(app, defaultAdmin, adminUserToken);
    await createClassWithId(app, { id: classId, teacherId: defaultTeacher.id });
  });

  afterEach(() => app.close());

  const getSession = (): request.Test =>
    request(app.getHttpServer())
      .get(`/classes/${classId}/sessions/${sessionId}`)
      .expect(200);

  it("lists an anonymous student who joined without starting a task", async () => {
    await createSessionWithId(app, {
      id: sessionId,
      classId,
      isAnonymous: true,
    });
    const student = await createStudent(app, { id: 2501 });
    await createAnonymousStudent(app, { studentId: student.id, sessionId });

    const response = await getSession();

    expect(response.body.anonymousStudentIds).toEqual([student.id]);
  });

  it("returns no anonymous participants for a lesson nobody joined", async () => {
    await createSessionWithId(app, {
      id: sessionId,
      classId,
      isAnonymous: true,
    });

    const response = await getSession();

    expect(response.body.anonymousStudentIds).toEqual([]);
  });

  it("returns no anonymous participants for a class-roster lesson", async () => {
    await createSessionWithId(app, {
      id: sessionId,
      classId,
      isAnonymous: false,
    });
    const student = await createStudent(app, { id: 2502 });
    await createAuthenticatedStudent(app, { studentId: student.id, classId });

    const response = await getSession();

    expect(response.body.anonymousStudentIds).toEqual([]);
  });

  it("omits an anonymous student who left (soft-deleted)", async () => {
    await createSessionWithId(app, {
      id: sessionId,
      classId,
      isAnonymous: true,
    });
    const staying = await createStudent(app, { id: 2503 });
    await createAnonymousStudent(app, { studentId: staying.id, sessionId });
    const leaving = await createStudent(app, { id: 2504 });
    await createAnonymousStudent(app, { studentId: leaving.id, sessionId });

    const prisma = app.get(PrismaService);
    await prisma.anonymousStudent.update({
      where: { studentId: leaving.id },
      data: { deletedAt: new Date() },
    });

    const response = await getSession();

    expect(response.body.anonymousStudentIds).toEqual([staying.id]);
  });
});
