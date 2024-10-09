import { Test, TestingModule } from "@nestjs/testing";
import { AssignmentSubmissionsService } from "./assignmentsubmissions.service";

describe("AssignmentSubmissionsService", () => {
  let service: AssignmentSubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentSubmissionsService],
    }).compile();

    service = module.get<AssignmentSubmissionsService>(
      AssignmentSubmissionsService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
