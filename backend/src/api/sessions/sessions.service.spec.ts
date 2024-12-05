import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { SessionsService } from "./sessions.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("SessionsService", () => {
  let service: SessionsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [SessionsService],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
