import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { classes, defaultAdmin, defaultTeacher, users } from "test/seed";
import { adminUserToken, ensureUserExists } from "./helpers/user";
import { getApp } from "./helpers/index";

const checkClassesInList = (expectedClasses, returnedClasses): void => {
  expect(returnedClasses).toHaveLength(expectedClasses.length);
  returnedClasses.forEach((returnedClass) => {
    const { teacherId, ...referenceClass } = expectedClasses.find(
      (c) => c.id == returnedClass.id,
    );
    expect(returnedClass).toMatchObject(referenceClass);

    const {
      type: _ignore_type,
      oidcSub: _ignore_oidcSub,
      email: _ignore_email,
      authenticationProvider: _ignore_authenticationProvider,
      ...referenceTeacher
    } = users.find((u) => u.id === teacherId)!;
    expect(returnedClass.teacher).toMatchObject(referenceTeacher);
  });
};

jest.mock("src/api/authentication/helpers.ts", () => ({
  ...jest.requireActual("src/api/authentication/helpers.ts"),
  getTokenFromExecutionContext: jest.fn(() => adminUserToken),
}));

describe("ClassesController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await getApp();

    await ensureUserExists(app, defaultAdmin, adminUserToken);
  });

  afterEach(() => {
    app.close();
  });

  test("/classes (GET)", async () => {
    const response = await request(app.getHttpServer())
      .get("/classes")
      .expect(200);

    const returnedClasses = response.body;
    checkClassesInList(classes, returnedClasses);
  });

  test("/classes/:id (GET)", async () => {
    const klass = classes[0];
    const response = await request(app.getHttpServer())
      .get(`/classes/${klass.id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: klass.id,
      name: klass.name,
      teacher: {
        id: defaultTeacher.id,
        name: defaultTeacher.name,
      },
      sessions: [],
      students: [],
    });
  });

  test("/classes/:id (GET) - not found", async () => {
    const response = await request(app.getHttpServer())
      .get("/classes/999")
      .expect(404);

    expect(response.body.message).toBe("Not Found");
  });

  test("/classes (POST)", async () => {
    const dto = { name: "New Class", teacherId: defaultTeacher.id };

    const response = await request(app.getHttpServer())
      .post("/classes")
      .send(dto)
      .expect(201);

    expect(response.body).toEqual({ id: 1, ...dto, deletedAt: null });
  });

  test("/classes/:id (PATCH)", async () => {
    const klass = classes[0];
    const dto = { name: "Updated Class", teacherId: defaultTeacher.id };

    const response = await request(app.getHttpServer())
      .patch(`/classes/${klass.id}`)
      .send(dto)
      .expect(200);

    expect(response.body).toEqual({ id: klass.id, ...dto, deletedAt: null });
  });

  test("/classes/:id (DELETE)", async () => {
    const klass = classes[0];
    const response = await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: klass.id,
      teacherId: klass.teacherId,
    });

    expect(response.body.deletedAt).toBeTruthy();
  });

  test("DELETE should soft delete and not hard delete", async () => {
    const klass = classes[0];

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    await request(app.getHttpServer()).get(`/classes/${klass.id}`).expect(404);

    const deletedClass = await request(app.getHttpServer())
      .get(`/classes/${klass.id}?includeSoftDelete=true`)
      .expect(200);

    expect(deletedClass.body).not.toBeNull();
    expect(deletedClass.body.deletedAt).not.toBeNull();
    expect(new Date(deletedClass.body.deletedAt)).toBeInstanceOf(Date);
    expect(new Date(deletedClass.body.deletedAt).getTime()).toBeGreaterThan(0);
  });

  test("GET should not return soft deleted classes", async () => {
    const klass = classes[0];

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get("/classes")
      .expect(200);

    const returnedClasses = response.body;
    const deletedClassInList = returnedClasses.find((c) => c.id === klass.id);

    expect(deletedClassInList).toBeUndefined();
  });

  test("DELETE on already deleted class should be idempotent", async () => {
    const klass = classes[0];

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);
  });

  test("PATCH should not update soft deleted class", async () => {
    const klass = classes[0];

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    const dto = { name: "Should Not Update", teacherId: defaultTeacher.id };
    await request(app.getHttpServer())
      .patch(`/classes/${klass.id}`)
      .send(dto)
      .expect(404);
  });

  test("Soft deleted class should not appear in teacher's classes list", async () => {
    const klass = classes[0];

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/classes/?teacherId=${defaultTeacher.id}`)
      .expect(200);

    const returnedClasses = response.body;
    const deletedClassInList = returnedClasses.find((c) => c.id === klass.id);

    expect(deletedClassInList).toBeUndefined();
  });

  test("Soft deleted class data is preserved in database", async () => {
    const klass = classes[1];

    const beforeDelete = await request(app.getHttpServer())
      .get(`/classes/${klass.id}?includeSoftDelete=true`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/classes/${klass.id}`)
      .expect(200);

    await request(app.getHttpServer()).get(`/classes/${klass.id}`).expect(404);

    const deletedClass = await request(app.getHttpServer())
      .get(`/classes/${klass.id}?includeSoftDelete=true`)
      .expect(200);

    expect(deletedClass.body).not.toBeNull();
    expect(deletedClass.body.name).toBe(beforeDelete.body.name);
    expect(deletedClass.body.teacherId).toBe(beforeDelete.body.teacherId);
    expect(deletedClass.body.deletedAt).not.toBeNull();
  });
});
