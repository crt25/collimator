import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getApp } from "./helper";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await getApp();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
});
