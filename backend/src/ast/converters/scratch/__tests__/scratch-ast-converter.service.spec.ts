import { AstNodeType, GeneralAst } from "src/ast/types/general-ast";
import {
  createScratchBlockInput,
  createScratchCodeInput,
  createScratchCodeOutput,
  createScratchExpressionInput,
  createScratchExpressionOutput,
  createScratchHatOutput,
} from "./helpers";
import {
  ActorNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { convertScratchToGeneralAst } from "../";

describe("Scratch AST converter", () => {
  describe("Hat Blocks", () => {
    it("can convert 'event_whenflagclicked' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whenflagclicked",
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whenflagclicked",
            parameters: [],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'event_whenkeypressed' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whenkeypressed",
            next: null,
            parent: null,
            inputs: {},
            fields: {
              KEY_OPTION: ["space", null],
            },
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whenkeypressed",
            parameters: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "space",
              },
            ],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'event_whenthisspriteclicked' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whenthisspriteclicked",
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whenthisspriteclicked",
            parameters: [],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'event_whenstageclicked' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whenstageclicked",
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whenstageclicked",
            parameters: [],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'event_whenbackdropswitchesto' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whenbackdropswitchesto",
            next: null,
            parent: null,
            inputs: {},
            fields: {
              BACKDROP: ["backdrop 1", null],
            },
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whenbackdropswitchesto",
            parameters: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "backdrop 1",
              },
            ],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'event_whengreaterthan' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whengreaterthan",
            next: null,
            parent: null,
            inputs: { VALUE: [1, [4, "10"]] },
            fields: { WHENGREATERTHANMENU: ["LOUDNESS", null] },
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whengreaterthan",
            parameters: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "LOUDNESS",
              },
            ],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'event_whenbroadcastreceived' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "event_whenbroadcastreceived",
            next: null,
            parent: null,
            inputs: {},
            fields: {
              BROADCAST_OPTION: ["my broadcast variable", null],
            },
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "event_whenbroadcastreceived",
            parameters: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "my broadcast variable",
              },
            ],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });

    it("can convert 'control_start_as_clone' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          __start__: {
            opcode: "control_start_as_clone",
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
          },
        }),
      );

      expect(ast).toEqual(
        createScratchHatOutput({
          nodeType: AstNodeType.eventListener,
          condition: {
            event: "control_start_as_clone",
            parameters: [],
          },
          action: {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.sequence,
            statements: [],
          },
        }),
      );
    });
  });

  describe("Code blocks", () => {
    describe("Control Blocks", () => {
      it("can convert 'control_stop' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "control_stop",
              inputs: {},
              fields: { STOP_OPTION: ["all", null] },
              shadow: false,
              topLevel: false,
              mutation: {
                tagName: "mutation",
                children: [],
                hasnext: "false",
              },
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "control_stop",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "all",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'control_delete_this_clone' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "control_delete_this_clone",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "control_delete_this_clone",
              arguments: [],
            },
          ]),
        );
      });
    });

    describe("Data Blocks", () => {
      it("can convert 'data_setvariableto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_setvariableto",
              inputs: { VALUE: [1, [10, "0"]] },
              fields: {
                VARIABLE: ["my variable", "`jEk@4|i[#Fk?(8x)AV.-my variable"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_setvariableto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "0",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "my variable",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_changevariableby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_changevariableby",
              inputs: { VALUE: [1, [4, "1"]] },
              fields: {
                VARIABLE: ["my variable", "`jEk@4|i[#Fk?(8x)AV.-my variable"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_changevariableby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "my variable",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_showvariable' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_showvariable",
              inputs: {},
              fields: {
                VARIABLE: ["my variable", "`jEk@4|i[#Fk?(8x)AV.-my variable"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_showvariable",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "my variable",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_hidevariable' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_hidevariable",
              inputs: {},
              fields: {
                VARIABLE: ["my variable", "`jEk@4|i[#Fk?(8x)AV.-my variable"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_hidevariable",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "my variable",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_addtolist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_addtolist",
              inputs: { ITEM: [1, [10, "thing"]] },
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_addtolist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "thing",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_deleteoflist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_deleteoflist",
              inputs: { INDEX: [1, [7, "1"]] },
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_deleteoflist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_deletealloflist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_deletealloflist",
              inputs: {},
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_deletealloflist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_insertatlist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_insertatlist",
              inputs: { ITEM: [1, [10, "thing"]], INDEX: [1, [7, "1"]] },
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_insertatlist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "thing",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_replaceitemoflist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_replaceitemoflist",
              inputs: { INDEX: [1, [7, "1"]], ITEM: [1, [10, "thing"]] },
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_replaceitemoflist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "thing",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_showlist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_showlist",
              inputs: {},
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_showlist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'data_hidelist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "data_hidelist",
              inputs: {},
              fields: { LIST: ["x", "vZwVP@$4`(V,EP$uMhHe"] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "data_hidelist",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                },
              ],
            },
          ]),
        );
      });
    });

    describe("Event Blocks", () => {
      it("can convert 'event_broadcast' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "event_broadcast",
              inputs: {
                BROADCAST_INPUT: [1, [11, "message1", ";59V$Wizz#r59Sh4m{p_"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "event_broadcast",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "message1",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'event_broadcastandwait' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "event_broadcastandwait",
              inputs: {
                BROADCAST_INPUT: [1, [11, "message1", ";59V$Wizz#r59Sh4m{p_"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "event_broadcastandwait",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "message1",
                },
              ],
            },
          ]),
        );
      });
    });

    describe("Looks Blocks", () => {
      it("can convert 'looks_sayforsecs' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_sayforsecs",
              inputs: { MESSAGE: [1, [10, "Hello!"]], SECS: [1, [4, "2"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_sayforsecs",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "Hello!",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "2",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_say' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_say",
              inputs: { MESSAGE: [1, [10, "Hello!"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_say",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "Hello!",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_thinkforsecs' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_thinkforsecs",
              inputs: { MESSAGE: [1, [10, "Hmm..."]], SECS: [1, [4, "3"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_thinkforsecs",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "Hmm...",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "3",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_think' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_think",
              inputs: { MESSAGE: [1, [10, "Hmm..."]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_think",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "Hmm...",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_switchcostumeto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "looks_switchcostumeto",
                inputs: { COSTUME: [1, "child-id"] },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "looks_costume",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { COSTUME: ["costume2", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_switchcostumeto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "costume2",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_nextcostume' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_nextcostume",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_nextcostume",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'looks_switchbackdropto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "looks_switchbackdropto",
                inputs: {
                  BACKDROP: [1, "child-id"],
                },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "looks_backdrops",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { BACKDROP: ["backdrop1", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_switchbackdropto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "backdrop1",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_nextbackdrop' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_nextbackdrop",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_nextbackdrop",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'looks_changesizeby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_changesizeby",
              inputs: { CHANGE: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_changesizeby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "10",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_setsizeto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_setsizeto",
              inputs: { SIZE: [1, [4, "100"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_setsizeto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "100",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_changeeffectby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_changeeffectby",
              inputs: { CHANGE: [1, [4, "25"]] },
              fields: { EFFECT: ["WHIRL", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_changeeffectby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "25",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "WHIRL",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_seteffectto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_seteffectto",
              inputs: { VALUE: [1, [4, "0"]] },
              fields: { EFFECT: ["COLOR", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_seteffectto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "0",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "COLOR",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_cleargraphiceffects' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_cleargraphiceffects",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_cleargraphiceffects",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'looks_show' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_show",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_show",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'looks_hide' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_hide",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_hide",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'looks_gotofrontback' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_gotofrontback",
              inputs: {},
              fields: { FRONT_BACK: ["front", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_gotofrontback",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "front",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'looks_goforwardbackwardlayers' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "looks_goforwardbackwardlayers",
              inputs: { NUM: [1, [7, "1"]] },
              fields: { FORWARD_BACKWARD: ["forward", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "looks_goforwardbackwardlayers",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "forward",
                },
              ],
            },
          ]),
        );
      });
    });

    describe("Motion Blocks", () => {
      it("can convert 'motion_movesteps' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_movesteps",
              inputs: { STEPS: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_movesteps",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "10",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_turnright' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_turnright",
              inputs: { DEGREES: [1, [4, "15"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_turnright",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "15",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_turnleft' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_turnleft",
              inputs: { DEGREES: [1, [4, "15"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_turnleft",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "15",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_goto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "motion_goto",
                inputs: { TO: [1, "child-id"] },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "motion_goto_menu",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { TO: ["_random_", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_goto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "_random_",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_gotoxy' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_gotoxy",
              inputs: { X: [1, [4, "4"]], Y: [1, [4, "2"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_gotoxy",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "4",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "2",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_glideto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "motion_glideto",
                inputs: {
                  SECS: [1, [4, "1"]],
                  TO: [1, "child-id"],
                },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "motion_glideto_menu",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { TO: ["_random_", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_glideto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "_random_",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_glidesecstoxy' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_glidesecstoxy",
              inputs: {
                SECS: [1, [4, "1"]],
                X: [1, [4, "0"]],
                Y: [1, [4, "0"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_glidesecstoxy",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "0",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "0",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_pointindirection' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_pointindirection",
              inputs: { DIRECTION: [1, [8, "90"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_pointindirection",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "90",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_pointtowards' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "motion_pointtowards",
                inputs: { TOWARDS: [1, "child-id"] },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "motion_pointtowards_menu",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { TOWARDS: ["_mouse_", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_pointtowards",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "_mouse_",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_changexby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_changexby",
              inputs: { DX: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_changexby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "10",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_changeyby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_changeyby",
              inputs: { DY: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_changeyby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "10",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_setx' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_setx",
              inputs: { X: [1, [4, "0"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_setx",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "0",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_sety' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_sety",
              inputs: { Y: [1, [4, "0"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_sety",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "0",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'motion_ifonedgebounce' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_ifonedgebounce",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_ifonedgebounce",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'motion_setrotationstyle' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "motion_setrotationstyle",
              inputs: {},
              fields: { STYLE: ["left-right", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "motion_setrotationstyle",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "left-right",
                },
              ],
            },
          ]),
        );
      });
    });

    describe("Sensing Blocks", () => {
      it("can convert 'sensing_askandwait' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sensing_askandwait",
              inputs: {
                QUESTION: [1, [10, "What's your name?"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sensing_askandwait",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "What's your name?",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sensing_setdragmode' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sensing_setdragmode",
              inputs: {},
              fields: { DRAG_MODE: ["draggable", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sensing_setdragmode",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "draggable",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sensing_resettimer' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sensing_resettimer",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sensing_resettimer",
              arguments: [],
            },
          ]),
        );
      });
    });

    describe("Sound Blocks", () => {
      it("can convert 'sound_playuntildone' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "sound_playuntildone",
                inputs: { SOUND_MENU: [1, "child-id"] },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "sound_sounds_menu",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { SOUND_MENU: ["Meow", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_playuntildone",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "Meow",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sound_play' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput(
            [
              {
                opcode: "sound_play",
                inputs: { SOUND_MENU: [1, "child-id"] },
                fields: {},
                shadow: false,
                topLevel: false,
              },
            ],
            [
              {
                id: "child-id",
                opcode: "sound_sounds_menu",
                next: null,
                // reference block at index 0
                parent: "0",
                inputs: {},
                fields: { SOUND_MENU: ["Meow", null] },
                shadow: true,
                topLevel: false,
              },
            ],
          ),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_play",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "Meow",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sound_stopallsounds' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sound_stopallsounds",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_stopallsounds",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'sound_changeeffectby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sound_changeeffectby",
              inputs: { VALUE: [1, [4, "10"]] },
              fields: { EFFECT: ["PITCH", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_changeeffectby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "10",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "PITCH",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sound_seteffectto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sound_seteffectto",
              inputs: { VALUE: [1, [4, "100"]] },
              fields: { EFFECT: ["PITCH", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_seteffectto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "100",
                },
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "PITCH",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sound_cleareffects' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sound_cleareffects",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_cleareffects",
              arguments: [],
            },
          ]),
        );
      });

      it("can convert 'sound_changevolumeby' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sound_changevolumeby",
              inputs: { VOLUME: [1, [4, "-10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_changevolumeby",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "-10",
                },
              ],
            },
          ]),
        );
      });

      it("can convert 'sound_setvolumeto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchCodeInput([
            {
              opcode: "sound_setvolumeto",
              inputs: { VOLUME: [1, [4, "100"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchCodeOutput([
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "sound_setvolumeto",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "100",
                },
              ],
            },
          ]),
        );
      });
    });
  });

  describe("Expression Blocks", () => {
    describe("Data Blocks", () => {
      it("can convert 'data_itemoflist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "data_itemoflist",
              inputs: {
                INDEX: [1, [4, "10"]],
              },
              fields: {
                LIST: ["my list variable", "some id"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "data_itemoflist",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "my list variable",
              },
            ],
          }),
        );
      });

      it("can convert 'data_itemnumoflist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "data_itemnumoflist",
              inputs: {
                ITEM: [1, [10, "some element"]],
              },
              fields: {
                LIST: ["my list variable", "some id"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "data_itemnumoflist",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "some element",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "my list variable",
              },
            ],
          }),
        );
      });

      it("can convert 'data_lengthoflist' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "data_lengthoflist",
              inputs: {},
              fields: {
                LIST: ["my list variable", "some id"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "data_lengthoflist",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "my list variable",
              },
            ],
          }),
        );
      });

      it("can convert 'data_listcontainsitem' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "data_listcontainsitem",
              inputs: {
                ITEM: [1, [10, "some element"]],
              },
              fields: {
                LIST: ["my list variable", "some id"],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "data_listcontainsitem",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "some element",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "my list variable",
              },
            ],
          }),
        );
      });
    });

    describe("Looks Blocks", () => {
      it("can convert 'looks_costumenumbername' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "looks_costumenumbername",
              inputs: {},
              fields: { NUMBER_NAME: ["number", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "looks_costumenumbername",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "number",
              },
            ],
          }),
        );
      });

      it("can convert 'looks_backdropnumbername' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "looks_backdropnumbername",
              inputs: {},
              fields: { NUMBER_NAME: ["name", null] },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "looks_backdropnumbername",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "name",
              },
            ],
          }),
        );
      });

      it("can convert 'looks_size' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "looks_size",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "looks_size",
          }),
        );
      });
    });

    describe("Motion Blocks", () => {
      it("can convert 'motion_xposition' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "motion_xposition",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "motion_xposition",
          }),
        );
      });

      it("can convert 'motion_yposition' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "motion_yposition",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "motion_yposition",
          }),
        );
      });

      it("can convert 'motion_direction' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "motion_direction",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "motion_direction",
          }),
        );
      });
    });

    describe("Operator Blocks", () => {
      it("can convert 'operator_add' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_add",
              inputs: {
                NUM1: [1, "NUM1-BLOCK-ID"],
                NUM2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "NUM1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousex",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_add",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousex",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_subtract' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_subtract",
              inputs: {
                NUM1: [1, "NUM1-BLOCK-ID"],
                NUM2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "NUM1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousex",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_subtract",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousex",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_multiply' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_multiply",
              inputs: {
                NUM1: [1, "NUM1-BLOCK-ID"],
                NUM2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "NUM1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousex",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_multiply",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousex",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_divide' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_divide",
              inputs: {
                NUM1: [1, "NUM1-BLOCK-ID"],
                NUM2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "NUM1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousex",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_divide",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousex",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_random' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_random",
              inputs: {
                FROM: [1, [4, "2"]],
                TO: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_random",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "2",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_gt' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_gt",
              inputs: {
                OPERAND1: [1, [4, "2"]],
                OPERAND2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_gt",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "2",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_lt' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_lt",
              inputs: {
                OPERAND1: [1, [4, "2"]],
                OPERAND2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_lt",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "2",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_equals' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_equals",
              inputs: {
                OPERAND1: [1, [4, "2"]],
                OPERAND2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_equals",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "2",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_and' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_and",
              inputs: {
                OPERAND1: [1, "OPERAND1-BLOCK-ID"],
                OPERAND2: [1, "OPERAND2-BLOCK-ID"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "OPERAND1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "OPERAND2-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "operator_equals",
              inputs: {
                OPERAND1: [1, [4, "2"]],
                OPERAND2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_and",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousedown",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: "operator_equals",
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.literal,
                    type: "number",
                    value: "2",
                  },
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.literal,
                    type: "number",
                    value: "10",
                  },
                ],
              },
            ],
          }),
        );
      });

      it("can convert 'operator_or' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_or",
              inputs: {
                OPERAND1: [1, "OPERAND1-BLOCK-ID"],
                OPERAND2: [1, "OPERAND2-BLOCK-ID"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "OPERAND1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "OPERAND2-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "operator_equals",
              inputs: {
                OPERAND1: [1, [4, "2"]],
                OPERAND2: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_or",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousedown",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: "operator_equals",
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.literal,
                    type: "number",
                    value: "2",
                  },
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.literal,
                    type: "number",
                    value: "10",
                  },
                ],
              },
            ],
          }),
        );
      });

      it("can convert 'operator_not' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_not",
              inputs: {
                OPERAND: [1, "OPERAND-BLOCK-ID"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "OPERAND-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_not",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousedown",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_join' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_join",
              inputs: {
                STRING1: [1, "STRING1-BLOCK-ID"],
                STRING2: [1, [10, "world"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "STRING1-BLOCK-ID",
              parent: "expressionBlock",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_join",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "sensing_mousedown",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "world",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_letter_of' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_letter_of",
              inputs: {
                LETTER: [1, [4, "2"]],
                STRING: [1, [10, "world"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_letter_of",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "2",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "world",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_length' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_length",
              inputs: {
                STRING: [1, [10, "world"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_length",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "world",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_contains' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_contains",
              inputs: {
                STRING1: [1, [10, "0r"]],
                STRING2: [1, [10, "world"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_contains",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "0r",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "world",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_mod' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_mod",
              inputs: {
                STRING1: [1, [4, "10"]],
                STRING2: [1, [4, "2"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_mod",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "2",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_round' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_round",
              inputs: {
                STRING: [1, [4, "10"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_round",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
            ],
          }),
        );
      });

      it("can convert 'operator_mathop' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "operator_mathop",
              inputs: {
                NUM: [1, [4, "10"]],
              },
              fields: {
                OPERATOR: ["abs", null],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.operator,
            operator: "operator_mathop",
            operands: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "number",
                value: "10",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "abs",
              },
            ],
          }),
        );
      });
    });

    describe("Sensing Blocks", () => {
      it("can convert 'sensing_touchingobject' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_touchingobject",
              inputs: { TOUCHINGOBJECTMENU: [1, "7C|vW0Y3@|d[13rleAjj"] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "7C|vW0Y3@|d[13rleAjj",
              opcode: "sensing_touchingobjectmenu",
              next: null,
              parent: "expressionBlock",
              inputs: {},
              fields: { TOUCHINGOBJECTMENU: ["_mouse_", null] },
              shadow: true,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_touchingobject",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "_mouse_",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_touchingcolor' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_touchingcolor",
              inputs: { COLOR: [1, [9, "#a47069"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_touchingcolor",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "color",
                value: "#a47069",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_coloristouchingcolor' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_coloristouchingcolor",
              inputs: {
                COLOR: [1, [9, "#a47069"]],
                COLOR2: [1, [9, "#0aeb7a"]],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_coloristouchingcolor",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "color",
                value: "#a47069",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "color",
                value: "#0aeb7a",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_distanceto' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_distanceto",
              inputs: { DISTANCETOMENU: [1, "0]@)?kna.e_#t0)C`ob+"] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "0]@)?kna.e_#t0)C`ob+",
              opcode: "sensing_distancetomenu",
              next: null,
              parent: "expressionBlock",
              inputs: {},
              fields: { DISTANCETOMENU: ["_mouse_", null] },
              shadow: true,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_distanceto",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "_mouse_",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_answer' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_answer",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_answer",
          }),
        );
      });

      it("can convert 'sensing_keypressed' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_keypressed",
              inputs: { DISTANCETOMENU: [1, "0]@)?kna.e_#t0)C`ob+"] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "0]@)?kna.e_#t0)C`ob+",
              opcode: "sensing_keyoptions",
              next: null,
              parent: "expressionBlock",
              inputs: {},
              fields: { KEY_OPTION: ["q", null] },
              shadow: true,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_keypressed",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "q",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_mousedown' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_mousedown",
          }),
        );
      });

      it("can convert 'sensing_mousex' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_mousex",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_mousex",
          }),
        );
      });

      it("can convert 'sensing_mousey' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_mousey",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_mousey",
          }),
        );
      });

      it("can convert 'sensing_loudness' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_loudness",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_loudness",
          }),
        );
      });

      it("can convert 'sensing_timer' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_timer",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_timer",
          }),
        );
      });

      it("can convert 'sensing_of' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_of",
              inputs: {
                OBJECT: [1, "0]@)?kna.e_#t0)C`ob+"],
              },
              fields: {
                PROPERTY: ["backdrop #", null],
              },
              shadow: false,
              topLevel: false,
            },
            {
              id: "0]@)?kna.e_#t0)C`ob+",
              opcode: "sensing_of_object_menu",
              next: null,
              parent: "expressionBlock",
              inputs: {},
              fields: { OBJECT: ["Stage", null] },
              shadow: true,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_of",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "Stage",
              },
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "backdrop #",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_current' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_current",
              fields: {
                CURRENTMENU: ["year", null],
              },
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.functionCall,
            name: "sensing_current",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "string",
                value: "year",
              },
            ],
          }),
        );
      });

      it("can convert 'sensing_dayssince2000' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_dayssince2000",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_dayssince2000",
          }),
        );
      });

      it("can convert 'sensing_username' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sensing_username",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sensing_username",
          }),
        );
      });
    });

    describe("Sound Blocks", () => {
      it("can convert 'sound_volume' blocks to general AST nodes", () => {
        const ast = convertScratchToGeneralAst(
          createScratchExpressionInput([
            {
              opcode: "sound_volume",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ]),
        );

        expect(ast).toEqual(
          createScratchExpressionOutput({
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.variable,
            name: "sound_volume",
          }),
        );
      });
    });
  });

  describe("Variables", () => {
    it("can convert code blocks with variables to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchCodeInput([
          {
            opcode: "motion_movesteps",
            inputs: {
              STEPS: [
                3,
                [12, "my variable", "`jEk@4|i[#Fk?(8x)AV.-my variable"],
                [4, "10"],
              ],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
        ]),
      );

      expect(ast).toEqual(
        createScratchCodeOutput([
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.functionCall,
            name: "motion_movesteps",
            arguments: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.variable,
                name: "my variable",
              },
            ],
          },
        ]),
      );
    });
  });

  describe("Control Blocks", () => {
    it("can convert 'control_repeat' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchCodeInput(
          [
            {
              opcode: "control_repeat",
              inputs: {
                TIMES: [1, [6, "5"]],
                SUBSTACK: [2, ")zYry8[Sj~`|4MC3*H6D"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
          [
            {
              id: ")zYry8[Sj~`|4MC3*H6D",
              opcode: "motion_movesteps",
              next: null,
              // reference to the block with index '0'
              parent: "0",
              inputs: { STEPS: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
        ),
      );

      expect(ast).toEqual(
        createScratchCodeOutput([
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.loop,
            condition: {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.functionCall,
              name: "loop_count_smaller_than",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "5",
                },
              ],
            },
            body: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: "motion_movesteps",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      );
    });

    it("can convert 'control_forever' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchCodeInput(
          [
            {
              opcode: "control_forever",
              inputs: {
                SUBSTACK: [2, ")zYry8[Sj~`|4MC3*H6D"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
          [
            {
              id: ")zYry8[Sj~`|4MC3*H6D",
              opcode: "motion_movesteps",
              next: null,
              // reference to the block with index '0'
              parent: "0",
              inputs: { STEPS: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
        ),
      );

      expect(ast).toEqual(
        createScratchCodeOutput([
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.loop,
            condition: {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "boolean",
              value: "true",
            },
            body: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: "motion_movesteps",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      );
    });

    it("can convert 'control_repeat_until' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchCodeInput(
          [
            {
              opcode: "control_repeat_until",
              inputs: {
                CONDITION: [2, "CONDITION-BLOCK-ID"],
                SUBSTACK: [2, ")zYry8[Sj~`|4MC3*H6D"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
          [
            {
              id: "CONDITION-BLOCK-ID",
              // reference to the block with index '0'
              parent: "0",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: ")zYry8[Sj~`|4MC3*H6D",
              // reference to the block with index '0'
              parent: "0",
              opcode: "motion_movesteps",
              next: null,
              inputs: { STEPS: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
        ),
      );

      expect(ast).toEqual(
        createScratchCodeOutput([
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.loop,
            condition: {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.operator,
              operator: "operator_not",
              operands: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "sensing_mousedown",
                },
              ],
            },
            body: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: "motion_movesteps",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      );
    });

    it("can convert 'control_if' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchCodeInput(
          [
            {
              opcode: "control_if",
              inputs: {
                CONDITION: [2, "CONDITION-BLOCK-ID"],
                SUBSTACK: [2, ")zYry8[Sj~`|4MC3*H6D"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
          [
            {
              id: "CONDITION-BLOCK-ID",
              // reference to the block with index '0'
              parent: "0",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: ")zYry8[Sj~`|4MC3*H6D",
              // reference to the block with index '0'
              parent: "0",
              opcode: "motion_movesteps",
              next: null,
              inputs: { STEPS: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
        ),
      );

      expect(ast).toEqual(
        createScratchCodeOutput([
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.condition,
            condition: {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.variable,
              name: "sensing_mousedown",
            },
            whenTrue: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: "motion_movesteps",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                  ],
                },
              ],
            },
            whenFalse: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [],
            },
          },
        ]),
      );
    });

    it("can convert 'control_if' blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchCodeInput(
          [
            {
              opcode: "control_if_else",
              inputs: {
                CONDITION: [2, "CONDITION-BLOCK-ID"],
                SUBSTACK: [2, "WHEN-TRUE-BLOCK-ID"],
                SUBSTACK2: [2, "WHEN-FALSE-BLOCK-ID"],
              },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
          [
            {
              id: "CONDITION-BLOCK-ID",
              // reference to the block with index '0'
              parent: "0",
              opcode: "sensing_mousedown",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "WHEN-TRUE-BLOCK-ID",
              // reference to the block with index '0'
              parent: "0",
              opcode: "motion_movesteps",
              next: null,
              inputs: { STEPS: [1, [4, "10"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            {
              id: "WHEN-FALSE-BLOCK-ID",
              // reference to the block with index '0'
              parent: "0",
              opcode: "motion_turnright",
              next: null,
              inputs: { DEGREES: [1, [4, "7"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          ],
        ),
      );

      expect(ast).toEqual(
        createScratchCodeOutput([
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.condition,
            condition: {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.variable,
              name: "sensing_mousedown",
            },
            whenTrue: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: "motion_movesteps",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                  ],
                },
              ],
            },
            whenFalse: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: "motion_turnright",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "7",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      );
    });
  });

  describe("Nested Control Blocks", () => {
    it("can convert nested control blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          "-^}qdJwGuHqP^)iz;_fC": {
            opcode: "event_whenflagclicked",
            next: "sd]uEA,C]m^llhnwpZL~",
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 373,
            y: 115,
          },
          ")zYry8[Sj~`|4MC3*H6D": {
            opcode: "motion_movesteps",
            next: "w3ZCE;2WUFqmN}+$bs~{",
            parent: "].VJxt(1P^P1Z(pzz9@~",
            inputs: { STEPS: [1, [4, "10"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "sd]uEA,C]m^llhnwpZL~": {
            opcode: "control_repeat",
            next: "zK6`=]dx[R`{om#yE^e7",
            parent: "-^}qdJwGuHqP^)iz;_fC",
            inputs: {
              TIMES: [1, [6, "10"]],
              SUBSTACK: [2, "xZeGHhOerUq=l=MQ2E;a"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "xZeGHhOerUq=l=MQ2E;a": {
            opcode: "control_forever",
            next: null,
            parent: "sd]uEA,C]m^llhnwpZL~",
            inputs: { SUBSTACK: [2, "].VJxt(1P^P1Z(pzz9@~"] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "].VJxt(1P^P1Z(pzz9@~": {
            opcode: "control_if",
            next: "cJV8T-?r6WB*AKrdgD#N",
            parent: "xZeGHhOerUq=l=MQ2E;a",
            inputs: {
              CONDITION: [2, "nr7ilieseuZ.tsy`+_G`"],
              SUBSTACK: [2, ")zYry8[Sj~`|4MC3*H6D"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "nr7ilieseuZ.tsy`+_G`": {
            opcode: "sensing_mousedown",
            next: null,
            parent: "].VJxt(1P^P1Z(pzz9@~",
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "w3ZCE;2WUFqmN}+$bs~{": {
            opcode: "control_if_else",
            next: "L[j;@wlbNee$m._/0zZC",
            parent: ")zYry8[Sj~`|4MC3*H6D",
            inputs: {
              CONDITION: [2, "/MU$K}ZxJ*Sk|tz%O5GN"],
              SUBSTACK: [2, "DNZ9o(O^t3A5az3ElOUC"],
              SUBSTACK2: [2, "^F{clsu^_H;3!t=nwOGy"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "/MU$K}ZxJ*Sk|tz%O5GN": {
            opcode: "operator_gt",
            next: null,
            parent: "w3ZCE;2WUFqmN}+$bs~{",
            inputs: { OPERAND1: [1, [10, "2"]], OPERAND2: [1, [10, "50"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "DNZ9o(O^t3A5az3ElOUC": {
            opcode: "motion_turnright",
            next: null,
            parent: "w3ZCE;2WUFqmN}+$bs~{",
            inputs: { DEGREES: [1, [4, "15"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "^F{clsu^_H;3!t=nwOGy": {
            opcode: "motion_turnleft",
            next: null,
            parent: "w3ZCE;2WUFqmN}+$bs~{",
            inputs: { DEGREES: [1, [4, "15"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "L[j;@wlbNee$m._/0zZC": {
            opcode: "control_repeat_until",
            next: "(R(/:+iZJx#C[IQ$Np]3",
            parent: "w3ZCE;2WUFqmN}+$bs~{",
            inputs: {
              CONDITION: [2, "vI;{%TdTSEE8f.Fm3Rzm"],
              SUBSTACK: [2, "?aM1Yef#|3Jx5lyJ!fqk"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "vI;{%TdTSEE8f.Fm3Rzm": {
            opcode: "operator_not",
            next: null,
            parent: "L[j;@wlbNee$m._/0zZC",
            inputs: { OPERAND: [2, "WbgbNwPy|A0#R:.4X8?`"] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "WbgbNwPy|A0#R:.4X8?`": {
            opcode: "sensing_mousedown",
            next: null,
            parent: "vI;{%TdTSEE8f.Fm3Rzm",
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "?aM1Yef#|3Jx5lyJ!fqk": {
            opcode: "motion_changexby",
            next: ",=eu!(71kfEQK}tF7iAQ",
            parent: "L[j;@wlbNee$m._/0zZC",
            inputs: { DX: [1, [4, "10"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "(R(/:+iZJx#C[IQ$Np]3": {
            opcode: "motion_sety",
            next: null,
            parent: "L[j;@wlbNee$m._/0zZC",
            inputs: { Y: [1, [4, "0"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "cJV8T-?r6WB*AKrdgD#N": {
            opcode: "motion_sety",
            next: null,
            parent: "].VJxt(1P^P1Z(pzz9@~",
            inputs: { Y: [1, [4, "0"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "zK6`=]dx[R`{om#yE^e7": {
            opcode: "motion_ifonedgebounce",
            next: null,
            parent: "sd]uEA,C]m^llhnwpZL~",
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: false,
          },
          ",=eu!(71kfEQK}tF7iAQ": {
            opcode: "control_forever",
            next: null,
            parent: "?aM1Yef#|3Jx5lyJ!fqk",
            inputs: { SUBSTACK: [2, "hhVzswJog#bXfQd~p)+R"] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "hhVzswJog#bXfQd~p)+R": {
            opcode: "motion_pointtowards",
            next: null,
            parent: ",=eu!(71kfEQK}tF7iAQ",
            inputs: { TOWARDS: [1, "O4CUo=-h{C=z/,2;F?mo"] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "O4CUo=-h{C=z/,2;F?mo": {
            opcode: "motion_pointtowards_menu",
            next: null,
            parent: "hhVzswJog#bXfQd~p)+R",
            inputs: {},
            fields: { TOWARDS: ["_mouse_", null] },
            shadow: true,
            topLevel: false,
          },
        }),
      );

      expect(ast).toEqual([
        {
          nodeType: AstNodeType.actor,
          componentId: "Stage",
          eventListeners: [
            {
              nodeType: AstNodeType.eventListener,
              condition: {
                event: "event_whenflagclicked",
                parameters: [],
              },
              action: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.loop,
                    condition: {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.functionCall,
                      name: "loop_count_smaller_than",
                      arguments: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "number",
                          value: "10",
                        },
                      ],
                    },
                    body: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.loop,
                          condition: {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.literal,
                            type: "boolean",
                            value: "true",
                          },
                          body: {
                            nodeType: AstNodeType.statement,
                            statementType: StatementNodeType.sequence,
                            statements: [
                              {
                                nodeType: AstNodeType.statement,
                                statementType: StatementNodeType.condition,
                                condition: {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.variable,
                                  name: "sensing_mousedown",
                                },
                                whenTrue: {
                                  nodeType: AstNodeType.statement,
                                  statementType: StatementNodeType.sequence,
                                  statements: [
                                    {
                                      nodeType: AstNodeType.statement,
                                      statementType:
                                        StatementNodeType.functionCall,
                                      name: "motion_movesteps",
                                      arguments: [
                                        {
                                          nodeType: AstNodeType.expression,
                                          expressionType:
                                            ExpressionNodeType.literal,
                                          type: "number",
                                          value: "10",
                                        },
                                      ],
                                    },
                                    {
                                      nodeType: AstNodeType.statement,
                                      statementType:
                                        StatementNodeType.condition,
                                      condition: {
                                        nodeType: AstNodeType.expression,
                                        expressionType:
                                          ExpressionNodeType.operator,
                                        operator: "operator_gt",
                                        operands: [
                                          {
                                            nodeType: AstNodeType.expression,
                                            expressionType:
                                              ExpressionNodeType.literal,
                                            type: "string",
                                            value: "2",
                                          },
                                          {
                                            nodeType: AstNodeType.expression,
                                            expressionType:
                                              ExpressionNodeType.literal,
                                            type: "string",
                                            value: "50",
                                          },
                                        ],
                                      },
                                      whenTrue: {
                                        nodeType: AstNodeType.statement,
                                        statementType:
                                          StatementNodeType.sequence,
                                        statements: [
                                          {
                                            nodeType: AstNodeType.statement,
                                            statementType:
                                              StatementNodeType.functionCall,
                                            name: "motion_turnright",
                                            arguments: [
                                              {
                                                nodeType:
                                                  AstNodeType.expression,
                                                expressionType:
                                                  ExpressionNodeType.literal,
                                                type: "number",
                                                value: "15",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      whenFalse: {
                                        nodeType: AstNodeType.statement,
                                        statementType:
                                          StatementNodeType.sequence,
                                        statements: [
                                          {
                                            nodeType: AstNodeType.statement,
                                            statementType:
                                              StatementNodeType.functionCall,
                                            name: "motion_turnleft",
                                            arguments: [
                                              {
                                                nodeType:
                                                  AstNodeType.expression,
                                                expressionType:
                                                  ExpressionNodeType.literal,
                                                type: "number",
                                                value: "15",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      nodeType: AstNodeType.statement,
                                      statementType: StatementNodeType.loop,
                                      condition: {
                                        nodeType: AstNodeType.expression,
                                        expressionType:
                                          ExpressionNodeType.operator,
                                        operator: "operator_not",
                                        operands: [
                                          {
                                            nodeType: AstNodeType.expression,
                                            expressionType:
                                              ExpressionNodeType.operator,
                                            operator: "operator_not",
                                            operands: [
                                              {
                                                nodeType:
                                                  AstNodeType.expression,
                                                expressionType:
                                                  ExpressionNodeType.variable,
                                                name: "sensing_mousedown",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      body: {
                                        nodeType: AstNodeType.statement,
                                        statementType:
                                          StatementNodeType.sequence,
                                        statements: [
                                          {
                                            nodeType: AstNodeType.statement,
                                            statementType:
                                              StatementNodeType.functionCall,
                                            name: "motion_changexby",
                                            arguments: [
                                              {
                                                nodeType:
                                                  AstNodeType.expression,
                                                expressionType:
                                                  ExpressionNodeType.literal,
                                                type: "number",
                                                value: "10",
                                              },
                                            ],
                                          },
                                          {
                                            nodeType: AstNodeType.statement,
                                            statementType:
                                              StatementNodeType.loop,
                                            condition: {
                                              nodeType: AstNodeType.expression,
                                              expressionType:
                                                ExpressionNodeType.literal,
                                              type: "boolean",
                                              value: "true",
                                            },
                                            body: {
                                              nodeType: AstNodeType.statement,
                                              statementType:
                                                StatementNodeType.sequence,
                                              statements: [
                                                {
                                                  nodeType:
                                                    AstNodeType.statement,
                                                  statementType:
                                                    StatementNodeType.functionCall,
                                                  name: "motion_pointtowards",
                                                  arguments: [
                                                    {
                                                      nodeType:
                                                        AstNodeType.expression,
                                                      expressionType:
                                                        ExpressionNodeType.literal,
                                                      type: "string",
                                                      value: "_mouse_",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      nodeType: AstNodeType.statement,
                                      statementType:
                                        StatementNodeType.functionCall,
                                      name: "motion_sety",
                                      arguments: [
                                        {
                                          nodeType: AstNodeType.expression,
                                          expressionType:
                                            ExpressionNodeType.literal,
                                          type: "number",
                                          value: "0",
                                        },
                                      ],
                                    },
                                  ],
                                },
                                whenFalse: {
                                  nodeType: AstNodeType.statement,
                                  statementType: StatementNodeType.sequence,
                                  statements: [],
                                },
                              },
                              {
                                nodeType: AstNodeType.statement,
                                statementType: StatementNodeType.functionCall,
                                name: "motion_sety",
                                arguments: [
                                  {
                                    nodeType: AstNodeType.expression,
                                    expressionType: ExpressionNodeType.literal,
                                    type: "number",
                                    value: "0",
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionCall,
                    name: "motion_ifonedgebounce",
                    arguments: [],
                  },
                ],
              },
            },
          ],
          functionDeclarations: [],
        } as ActorNode,
      ] as GeneralAst);
    });
  });

  describe("Nested Expression Blocks", () => {
    it("can convert nested expression blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          "-^}qdJwGuHqP^)iz;_fC": {
            opcode: "event_whenflagclicked",
            next: "r}lI`#J[7uxO0o(igHOg",
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 144,
            y: 95,
          },
          "r}lI`#J[7uxO0o(igHOg": {
            opcode: "control_if",
            next: null,
            parent: "-^}qdJwGuHqP^)iz;_fC",
            inputs: {
              SUBSTACK: [2, "Gu!_Ki}i$,j5^$oX*xz+"],
              CONDITION: [2, "}vWvbUzx4mP^eMTwWK~v"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "Gu!_Ki}i$,j5^$oX*xz+": {
            opcode: "motion_movesteps",
            next: null,
            parent: "r}lI`#J[7uxO0o(igHOg",
            inputs: { STEPS: [1, [4, "10"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "qIktiNy/jQv?{bZ/Hx(r": {
            opcode: "operator_equals",
            next: null,
            parent: "}vWvbUzx4mP^eMTwWK~v",
            inputs: {
              OPERAND1: [3, "?kN3]W/0f`Q$VlJ)WyV#", [10, ""]],
              OPERAND2: [3, "0}p$eRwnRtZ!BX~Z@^H[", [10, "50"]],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "]o?M;9B.3gNEfHO8zH,k": {
            opcode: "operator_add",
            next: null,
            parent: "~kz{aWkF4$L(S`C,NCk1",
            inputs: { NUM1: [1, [4, "2"]], NUM2: [1, [4, "60"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          ")VfPXq$r,1[(^o9@rQ5Y": {
            opcode: "operator_multiply",
            next: null,
            parent: "0}p$eRwnRtZ!BX~Z@^H[",
            inputs: {
              NUM1: [3, "vLIr0Z,;}IKq/}Nv|prA", [4, ""]],
              NUM2: [1, [4, "2"]],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "?kN3]W/0f`Q$VlJ)WyV#": {
            opcode: "operator_join",
            next: null,
            parent: "qIktiNy/jQv?{bZ/Hx(r",
            inputs: {
              STRING1: [1, [10, "apple "]],
              STRING2: [1, [10, "banana"]],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "xYXqg^b0P12XR[_O65lq": {
            opcode: "operator_length",
            next: null,
            parent: "0}p$eRwnRtZ!BX~Z@^H[",
            inputs: { STRING: [1, [10, "apple"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "0}p$eRwnRtZ!BX~Z@^H[": {
            opcode: "operator_mod",
            next: null,
            parent: "qIktiNy/jQv?{bZ/Hx(r",
            inputs: {
              NUM1: [3, "xYXqg^b0P12XR[_O65lq", [4, ""]],
              NUM2: [3, ")VfPXq$r,1[(^o9@rQ5Y", [4, ""]],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "vLIr0Z,;}IKq/}Nv|prA": {
            opcode: "operator_mathop",
            next: null,
            parent: ")VfPXq$r,1[(^o9@rQ5Y",
            inputs: { NUM: [3, "1pHQ_bjJ:;=2wW.~9P$.", [4, ""]] },
            fields: { OPERATOR: ["abs", null] },
            shadow: false,
            topLevel: false,
          },
          "1pHQ_bjJ:;=2wW.~9P$.": {
            opcode: "operator_random",
            next: null,
            parent: "vLIr0Z,;}IKq/}Nv|prA",
            inputs: { FROM: [1, [4, "1"]], TO: [1, [4, "10"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "}vWvbUzx4mP^eMTwWK~v": {
            opcode: "operator_or",
            next: null,
            parent: "r}lI`#J[7uxO0o(igHOg",
            inputs: {
              OPERAND2: [2, "qIktiNy/jQv?{bZ/Hx(r"],
              OPERAND1: [2, "~kz{aWkF4$L(S`C,NCk1"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "~kz{aWkF4$L(S`C,NCk1": {
            opcode: "operator_gt",
            next: null,
            parent: "}vWvbUzx4mP^eMTwWK~v",
            inputs: {
              OPERAND1: [3, "]o?M;9B.3gNEfHO8zH,k", [10, ""]],
              OPERAND2: [1, [10, "50"]],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
        }),
      );

      expect(ast).toEqual([
        {
          nodeType: AstNodeType.actor,
          componentId: "Stage",
          eventListeners: [
            {
              nodeType: AstNodeType.eventListener,
              condition: {
                event: "event_whenflagclicked",
                parameters: [],
              },
              action: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.condition,
                    condition: {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: "operator_or",
                      operands: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.operator,
                          operator: "operator_gt",
                          operands: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: "operator_add",
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "number",
                                  value: "2",
                                },
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "number",
                                  value: "60",
                                },
                              ],
                            },
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "string",
                              value: "50",
                            },
                          ],
                        },
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.operator,
                          operator: "operator_equals",
                          operands: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: "operator_join",
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "string",
                                  value: "apple ",
                                },
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "string",
                                  value: "banana",
                                },
                              ],
                            },
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: "operator_mod",
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.operator,
                                  operator: "operator_length",
                                  operands: [
                                    {
                                      nodeType: AstNodeType.expression,
                                      expressionType:
                                        ExpressionNodeType.literal,
                                      type: "string",
                                      value: "apple",
                                    },
                                  ],
                                },
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.operator,
                                  operator: "operator_multiply",
                                  operands: [
                                    {
                                      nodeType: AstNodeType.expression,
                                      expressionType:
                                        ExpressionNodeType.operator,
                                      operator: "operator_mathop",
                                      operands: [
                                        {
                                          nodeType: AstNodeType.expression,
                                          expressionType:
                                            ExpressionNodeType.operator,
                                          operator: "operator_random",
                                          operands: [
                                            {
                                              nodeType: AstNodeType.expression,
                                              expressionType:
                                                ExpressionNodeType.literal,
                                              type: "number",
                                              value: "1",
                                            },
                                            {
                                              nodeType: AstNodeType.expression,
                                              expressionType:
                                                ExpressionNodeType.literal,
                                              type: "number",
                                              value: "10",
                                            },
                                          ],
                                        },
                                        {
                                          nodeType: AstNodeType.expression,
                                          expressionType:
                                            ExpressionNodeType.literal,
                                          type: "string",
                                          value: "abs",
                                        },
                                      ],
                                    },
                                    {
                                      nodeType: AstNodeType.expression,
                                      expressionType:
                                        ExpressionNodeType.literal,
                                      type: "number",
                                      value: "2",
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    whenTrue: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.functionCall,
                          name: "motion_movesteps",
                          arguments: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "number",
                              value: "10",
                            },
                          ],
                        },
                      ],
                    },
                    whenFalse: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [],
                    },
                  },
                ],
              },
            },
          ],
          functionDeclarations: [],
        },
      ] as GeneralAst);
    });
  });

  describe("Procedure Blocks", () => {
    it("can convert custom block definitions to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          "-^}qdJwGuHqP^)iz;_fC": {
            opcode: "event_whenflagclicked",
            next: ").,xmdC`fjYd:$u$}E7c",
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 144,
            y: 95,
          },
          "%oa2KfYn$Z)n}F-NWPXm": {
            opcode: "procedures_definition",
            next: "GDc)lt)LG=Rvd,7wx*RW",
            parent: null,
            inputs: { custom_block: [1, "La=c$K*CO3;-y85,]Wov"] },
            fields: {},
            shadow: false,
            topLevel: true,
            x: 421,
            y: 403,
          },
          "La=c$K*CO3;-y85,]Wov": {
            opcode: "procedures_prototype",
            next: null,
            parent: "%oa2KfYn$Z)n}F-NWPXm",
            inputs: {
              "Pnu/50Ndlu+=Ei;qE$f_": [1, "UqOctWR?YF-m9{q(Y8*C"],
              "nfc;-VzSP][nvtjyb3*4": [1, "Z;`8onT{|.D;5ZJ8fV;u"],
            },
            fields: {},
            shadow: true,
            topLevel: false,
            mutation: {
              tagName: "mutation",
              children: [],
              proccode: "my block %s %b",
              argumentids: '["Pnu/50Ndlu+=Ei;qE$f_","nfc;-VzSP][nvtjyb3*4"]',
              argumentnames: '["number or text","boolean"]',
              argumentdefaults: '["","false"]',
              warp: "false",
            },
          },
          "UqOctWR?YF-m9{q(Y8*C": {
            opcode: "argument_reporter_string_number",
            next: null,
            parent: "La=c$K*CO3;-y85,]Wov",
            inputs: {},
            fields: { VALUE: ["number or text", null] },
            shadow: true,
            topLevel: false,
          },
          "Z;`8onT{|.D;5ZJ8fV;u": {
            opcode: "argument_reporter_boolean",
            next: null,
            parent: "La=c$K*CO3;-y85,]Wov",
            inputs: {},
            fields: { VALUE: ["boolean", null] },
            shadow: true,
            topLevel: false,
          },
          "x`ya;Y5fL?~8m+Nqpd3i": {
            opcode: "motion_movesteps",
            next: null,
            parent: "GDc)lt)LG=Rvd,7wx*RW",
            inputs: { STEPS: [3, "zsRJ9$j3D*qQ:0%J(-Rs", [4, "10"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "GDc)lt)LG=Rvd,7wx*RW": {
            opcode: "control_if",
            next: null,
            parent: "%oa2KfYn$Z)n}F-NWPXm",
            inputs: {
              SUBSTACK: [2, "x`ya;Y5fL?~8m+Nqpd3i"],
              CONDITION: [2, "Ov:mfZ?TYdbtB~-s8Ze,"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
          "Ov:mfZ?TYdbtB~-s8Ze,": {
            opcode: "argument_reporter_boolean",
            next: null,
            parent: "GDc)lt)LG=Rvd,7wx*RW",
            inputs: {},
            fields: { VALUE: ["boolean", null] },
            shadow: false,
            topLevel: false,
          },
          "zsRJ9$j3D*qQ:0%J(-Rs": {
            opcode: "argument_reporter_string_number",
            next: null,
            parent: "x`ya;Y5fL?~8m+Nqpd3i",
            inputs: {},
            fields: { VALUE: ["number or text", null] },
            shadow: false,
            topLevel: false,
          },
          ").,xmdC`fjYd:$u$}E7c": {
            opcode: "procedures_call",
            next: null,
            parent: "-^}qdJwGuHqP^)iz;_fC",
            inputs: {
              "Pnu/50Ndlu+=Ei;qE$f_": [1, [10, "20"]],
              "nfc;-VzSP][nvtjyb3*4": [2, "0#$]=TNKF:$cGN{/R}Js"],
            },
            fields: {},
            shadow: false,
            topLevel: false,
            mutation: {
              tagName: "mutation",
              children: [],
              proccode: "my block %s %b",
              argumentids: '["Pnu/50Ndlu+=Ei;qE$f_","nfc;-VzSP][nvtjyb3*4"]',
              warp: "false",
            },
          },
          "0#$]=TNKF:$cGN{/R}Js": {
            opcode: "operator_equals",
            next: null,
            parent: ").,xmdC`fjYd:$u$}E7c",
            inputs: {
              OPERAND1: [1, [10, "50"]],
              OPERAND2: [1, [10, "50"]],
            },
            fields: {},
            shadow: false,
            topLevel: false,
          },
        }),
      );

      expect(ast).toEqual([
        {
          nodeType: AstNodeType.actor,
          componentId: "Stage",
          eventListeners: [
            {
              nodeType: AstNodeType.eventListener,
              condition: {
                event: "event_whenflagclicked",
                parameters: [],
              },
              action: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionCall,
                    name: "my block %s %b",
                    arguments: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.operator,
                        operator: "operator_equals",
                        operands: [
                          {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.literal,
                            type: "string",
                            value: "50",
                          },
                          {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.literal,
                            type: "string",
                            value: "50",
                          },
                        ],
                      },
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "string",
                        value: "20",
                      },
                    ],
                  },
                ],
              },
            },
          ],
          functionDeclarations: [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionDeclaration,
              name: "my block %s %b",
              parameterNames: ["number or text", "boolean"],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.condition,
                    condition: {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.variable,
                      name: "boolean",
                    },
                    whenTrue: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.functionCall,
                          name: "motion_movesteps",
                          arguments: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.variable,
                              name: "number or text",
                            },
                          ],
                        },
                      ],
                    },
                    whenFalse: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [],
                    },
                  },
                ],
              },
            },
          ],
        },
      ] as GeneralAst);
    });
  });

  describe("Extension Blocks", () => {
    it("can convert arbitrary extension functionCall blocks to general AST nodes", () => {
      const ast = convertScratchToGeneralAst(
        createScratchBlockInput({
          "o+VBPu+C(?OjVM9re*i8": {
            opcode: "event_whenflagclicked",
            next: "N/T.RXB%SE9Op.]VNvne",
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 362,
            y: 71,
          },
          "N/T.RXB%SE9Op.]VNvne": {
            opcode: "example_functionCall_setX",
            next: null,
            parent: "o+VBPu+C(?OjVM9re*i8",
            inputs: { TEMPO: [1, [4, "60"]] },
            fields: {},
            shadow: false,
            topLevel: false,
          },
        }),
      );

      expect(ast).toEqual([
        {
          nodeType: AstNodeType.actor,
          componentId: "Stage",
          eventListeners: [
            {
              nodeType: AstNodeType.eventListener,
              condition: {
                event: "event_whenflagclicked",
                parameters: [],
              },
              action: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionCall,
                    name: "example_setX",
                    arguments: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "number",
                        value: "60",
                      },
                    ],
                  },
                ],
              },
            },
          ],
          functionDeclarations: [],
        },
      ] as GeneralAst);
    });
  });
});
