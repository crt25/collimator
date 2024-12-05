import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { SessionsService } from "./sessions.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("SessionsService", () => {
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [SessionsService],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
