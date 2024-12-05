import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { ClassesService } from "./classes.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("ClassesService", () => {
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [ClassesService],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
