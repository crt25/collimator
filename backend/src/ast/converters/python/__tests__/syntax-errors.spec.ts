import { convertPythonToGeneralAst } from "../";
import { PythonSyntaxError } from "../python-syntax-error";

const version = "3.10.4";

describe("Python AST converter", () => {
  describe("syntax errors", () => {
    // Invalid Python must be rejected with a controlled PythonSyntaxError -
    // not an uncontrolled TypeError from a half-built parse tree, and not a
    // silently converted garbage AST.
    it.each([
      ["unclosed def", "def f(:\n    pass\n"],
      ["lone operator", "x = +\n"],
      ["malformed case pattern", "match x:\n    case Foo(a=):\n        pass\n"],
      ["malformed del target", "del (:\n"],
      ["stray indent", "x = 1\n    y = 2\n"],
      ["unterminated string", 'x = "abc\n'],
    ])("rejects %s", (_label, source) => {
      expect(() => convertPythonToGeneralAst(source, version)).toThrow(
        PythonSyntaxError,
      );
    });

    it.each([
      ["simple assignment", "x = 1\n"],
      ["function definition", "def f(x):\n    return x\n"],
      ["comment only", "# just a comment\n"],
      ["empty input", ""],
    ])("still accepts valid python: %s", (_label, source) => {
      expect(() => convertPythonToGeneralAst(source, version)).not.toThrow();
    });
  });
});
