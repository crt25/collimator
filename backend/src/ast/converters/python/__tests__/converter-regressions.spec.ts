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

    it("distinguishes def from async def", () => {
      expect(
        convertPythonToGeneralAst("def f():\n    pass\n", version),
      ).not.toEqual(
        convertPythonToGeneralAst("async def f():\n    pass\n", version),
      );
    });

    it("marks only async functions as async", () => {
      expect(astJson("async def f():\n    pass\n")).toContain('"isAsync":true');
      expect(astJson("def f():\n    pass\n")).not.toContain('"isAsync"');
    });
  });
});
