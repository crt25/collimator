import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { adminUser, adminUserToken, ensureUserExists } from "./helper";

jest.mock("src/api/authentication/helpers.ts", () => ({
  ...jest.requireActual("src/api/authentication/helpers.ts"),
  getTokenFromExecutionContext: jest.fn(() => adminUserToken),
}));

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await ensureUserExists(app, adminUser, adminUserToken);
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
});
