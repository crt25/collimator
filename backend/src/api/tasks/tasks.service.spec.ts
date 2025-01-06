import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
