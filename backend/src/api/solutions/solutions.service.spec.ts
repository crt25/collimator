import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { AstConversionService } from "src/ast/ast-conversion.service";
import { TasksService } from "../tasks/tasks.service";
import { SolutionsService } from "./solutions.service";
import { SolutionAnalysisService } from "./solution-analysis.service";

describe("SolutionsService", () => {
  let service: SolutionsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [
        TasksService,
        AstConversionService,
        SolutionAnalysisService,
        SolutionsService,
      ],
    }).compile();

    service = module.get<SolutionsService>(SolutionsService);
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
