import { subtle } from "crypto";
import KeyPair from "../../KeyPair";
import StudentKeyPair from "../../StudentKeyPair";

const generateKeyPair = (): Promise<KeyPair> =>
  StudentKeyPair.generate(subtle as SubtleCrypto);

describe("StudentKeyPair", () => {
  describe("generateTeacherKeyPair", () => {
    it("generates a key pair", async () => {
      await expect(generateKeyPair()).resolves.not.toThrow();
    });
  });
});
