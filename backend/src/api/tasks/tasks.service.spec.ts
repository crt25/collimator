import { Test, TestingModule } from "@nestjs/testing";
import { CoreModule } from "src/core/core.module";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { ErrorCode } from "../exceptions/error-codes";
import {
  TasksService,
  DuplicateReferenceSolutionError,
  ReferenceSolutionInput,
} from "./tasks.service";

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

  describe("update", () => {
    const taskId = 1;
    const duplicateBuffer = Buffer.from("same-content");

    const makeMulterFile = (content: Buffer): Express.Multer.File => ({
      buffer: content,
      mimetype: "application/octet-stream",
      fieldname: "file",
      originalname: "solution.txt",
      encoding: "utf-8",
      size: content.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stream: null as any,
      destination: "",
      filename: "",
      path: "",
    });

    const makeReferenceSolution = (
      overrides: Partial<ReferenceSolutionInput> = {},
    ): ReferenceSolutionInput => ({
      title: "Solution",
      description: "A solution",
      isInitial: false,
      tests: [],
      ...overrides,
    });

    const duplicateReferenceSolutions = [
      makeReferenceSolution({ title: "Solution A" }),
      makeReferenceSolution({ title: "Solution B" }),
    ];

    const duplicateFiles = [
      makeMulterFile(duplicateBuffer),
      makeMulterFile(duplicateBuffer),
    ];

    it("should throw DuplicateReferenceSolutionError with correct error code when two reference solutions have the same file content", async () => {
      const promise = service.update(
        taskId,
        { title: "Updated Task" },
        "application/pdf",
        new Uint8Array(duplicateBuffer),
        duplicateReferenceSolutions,
        duplicateFiles,
      );

      await expect(promise).rejects.toThrow(DuplicateReferenceSolutionError);
      await expect(promise).rejects.toMatchObject({
        errorCode: ErrorCode.DUPLICATE_REFERENCE_SOLUTION,
      });
    });

    it("should not throw DuplicateReferenceSolutionError when reference solutions have different file content", async () => {
      const files = [
        makeMulterFile(Buffer.from("content-a")),
        makeMulterFile(Buffer.from("content-b")),
      ];

      await service.update(
        taskId,
        { title: "Updated Task" },
        "application/pdf",
        new Uint8Array(Buffer.from("task-data")),
        duplicateReferenceSolutions,
        files,
      );
    });
  });
});
