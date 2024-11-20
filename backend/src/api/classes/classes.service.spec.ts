import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { ClassesService } from "./classes.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("ClassesService", () => {
  let service: ClassesService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [ClassesService],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
