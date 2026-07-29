import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { PatchStudentReferenceSolutionDto } from "./patch-student-reference-solution.dto";

describe("PatchStudentReferenceSolutionDto", () => {
  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });
  const metadata = {
    type: "body" as const,
    metatype: PatchStudentReferenceSolutionDto,
  };

  it("accepts base64url-encoded hashes", async () => {
    await expect(
      validationPipe.transform(
        {
          isReference: true,
          solutionHashes: ["YWJjZA", "a-b_c"],
        },
        metadata,
      ),
    ).resolves.toEqual({
      isReference: true,
      solutionHashes: ["YWJjZA", "a-b_c"],
    });
  });

  it.each(["not valid!", "YWJjZA==", "", "ümlaut"])(
    "rejects malformed base64url hash %p",
    async (solutionHash) => {
      await expect(
        validationPipe.transform(
          { isReference: true, solutionHashes: [solutionHash] },
          metadata,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});
