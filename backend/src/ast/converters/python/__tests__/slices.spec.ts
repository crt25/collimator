import { convertPythonToGeneralAst } from "../";

const version = "3.10.4";

// The create-slice operator name encodes which of start/stop/step are present
// (e.g. "create-slice-stop"). These tests pin down that each expression is
// bucketed by its position relative to the colons, not by count: `a[:2]` is a
// stop, `a[::2]` is a step, and they must not collapse into the same AST.
const sliceOperatorOf = (source: string): string => {
  const asJson = JSON.stringify(convertPythonToGeneralAst(source, version));
  const match = /"operator":"(create-slice[a-z-]*)"/.exec(asJson);
  return match ? match[1] : `<no create-slice operator in ${asJson}>`;
};

describe("Python AST converter", () => {
  describe("slices", () => {
    it("converts a full-open slice a[:]", () => {
      expect(sliceOperatorOf("y = a[:]\n")).toBe("create-slice");
    });

    it("converts a full-open slice a[::]", () => {
      expect(sliceOperatorOf("y = a[::]\n")).toBe("create-slice");
    });

    it("converts a stop-only slice a[:2]", () => {
      expect(sliceOperatorOf("y = a[:2]\n")).toBe("create-slice-stop");
    });

    it("converts a step-only slice a[::2]", () => {
      expect(sliceOperatorOf("y = a[::2]\n")).toBe("create-slice-step");
    });

    it("converts a stop slice with a trailing colon a[:2:]", () => {
      expect(sliceOperatorOf("y = a[:2:]\n")).toBe("create-slice-stop");
    });

    it("converts a start-only slice a[1:]", () => {
      expect(sliceOperatorOf("y = a[1:]\n")).toBe("create-slice-start");
    });

    it("converts a start and step slice a[1::3]", () => {
      expect(sliceOperatorOf("y = a[1::3]\n")).toBe("create-slice-start-step");
    });

    it("converts a stop and step slice a[:2:3]", () => {
      expect(sliceOperatorOf("y = a[:2:3]\n")).toBe("create-slice-stop-step");
    });

    it("converts a start and stop slice a[1:2]", () => {
      expect(sliceOperatorOf("y = a[1:2]\n")).toBe("create-slice-start-stop");
    });

    it("converts a full slice a[1:2:3]", () => {
      expect(sliceOperatorOf("y = a[1:2:3]\n")).toBe(
        "create-slice-start-stop-step",
      );
    });

    it("produces different ASTs for a[:2] and a[::2]", () => {
      expect(convertPythonToGeneralAst("y = a[:2]\n", version)).not.toEqual(
        convertPythonToGeneralAst("y = a[::2]\n", version),
      );
    });

    // Only the slice rule's own colons determine the buckets; colons nested
    // inside the bound expressions (dict literals, inner subscripts, ...) are
    // part of their own subtrees and must not shift the classification.
    it("buckets correctly with nested subscripts as bounds", () => {
      expect(sliceOperatorOf("y = a[b[1]:c[2]]\n")).toBe(
        "create-slice-start-stop",
      );
    });

    it("buckets correctly with arithmetic expressions as bounds", () => {
      expect(sliceOperatorOf("y = a[x + 1 : y * 2 : z ** 2]\n")).toBe(
        "create-slice-start-stop-step",
      );
    });

    it("is not confused by a dict literal's colon inside a bound", () => {
      expect(sliceOperatorOf("y = a[{1: 2}[1]:]\n")).toBe("create-slice-start");
    });

    it("is not confused by a nested slice inside a bound", () => {
      expect(sliceOperatorOf("y = a[b[1:2]:]\n")).toBe("create-slice-start");
    });

    it("buckets correctly with call expressions as bounds", () => {
      expect(sliceOperatorOf("y = a[f(1):g(2)]\n")).toBe(
        "create-slice-start-stop",
      );
    });
  });
});
