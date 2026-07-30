import { convertPythonToGeneralAst } from "../";

const version = "3.10.4";

const astJson = (source: string): string =>
  JSON.stringify(convertPythonToGeneralAst(source, version));

describe("Python AST converter", () => {
  describe("regressions", () => {
    it("converts a bare yield to a yield operator without operands", () => {
      const asJson = astJson("def f():\n    yield\n");

      expect(asJson).toContain('"operator":"yield","operands":[]');
    });

    it("converts a star-unpacking that follows a keyword argument", () => {
      // `*args` after a keyword argument is parsed via the grammar's kwargs
      // branch; it must still come out as the same unpack operator as a plain
      // `f(*args)` call.
      const asJson = astJson("f(x=2, *args)\n");

      expect(asJson).toContain('"operator":"*"');
      expect(asJson).toContain('"name":"args"');
      expect(asJson).toContain('"operator":"named-parameter"');
      expect(asJson).toContain('"value":"x"');
    });
  });
});
