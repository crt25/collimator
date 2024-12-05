import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { SolutionsService } from "./solutions.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("SolutionsService", () => {
  let service: SolutionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [SolutionsService],
    }).compile();

    service = module.get<SolutionsService>(SolutionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
