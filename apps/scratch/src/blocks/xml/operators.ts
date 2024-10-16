import { ColorSet } from "@scratch-submodule/scratch-gui/src/lib/themes";
import ScratchBlocks from "scratch-blocks";
import { categorySeparator } from "./constants";

export enum OperatorsOpCode {
  add = "operator_add",
  subtract = "operator_subtract",
  multiply = "operator_multiply",
  divide = "operator_divide",
  random = "operator_random",
  gt = "operator_gt",
  lt = "operator_lt",
  equals = "operator_equals",
  and = "operator_and",
  or = "operator_or",
  not = "operator_not",
  join = "operator_join",
  letter_of = "operator_letter_of",
  length = "operator_length",
  contains = "operator_contains",
  mod = "operator_mod",
  round = "operator_round",
  mathop = "operator_mathop",
}

const apple = ScratchBlocks.ScratchMsgs.translate(
  "OPERATORS_JOIN_APPLE",
  "apple",
);
const banana = ScratchBlocks.ScratchMsgs.translate(
  "OPERATORS_JOIN_BANANA",
  "banana",
);
const letter = ScratchBlocks.ScratchMsgs.translate(
  "OPERATORS_LETTEROF_APPLE",
  "a",
);

const operatorXmlByOpCode: Record<
  OperatorsOpCode,
  (isInitialSetup: boolean) => string
> = {
  [OperatorsOpCode.add]: () => `
        <block type="operator_add">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.subtract]: () => `
        <block type="operator_subtract">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.multiply]: () => `
        <block type="operator_multiply">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.divide]: () => `
        <block type="operator_divide">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.random]: () => `
        <block type="operator_random">
            <value name="FROM">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.gt]: () => `
        <block type="operator_gt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.lt]: () => `
        <block type="operator_lt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.equals]: () => `
        <block type="operator_equals">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.and]: () => `
        <block type="operator_and"/>`,
  [OperatorsOpCode.or]: () => `
        <block type="operator_or"/>`,
  [OperatorsOpCode.not]: () => `
        <block type="operator_not"/>`,
  [OperatorsOpCode.join]: (isInitialSetup) =>
    isInitialSetup
      ? ""
      : `
        <block type="operator_join">
            <value name="STRING1">
                <shadow type="text">
                    <field name="TEXT">${apple} </field>
                </shadow>
            </value>
            <value name="STRING2">
                <shadow type="text">
                    <field name="TEXT">${banana}</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.letter_of]: (isInitialSetup) =>
    isInitialSetup
      ? ""
      : `
        <block type="operator_letter_of">
            <value name="LETTER">
                <shadow type="math_whole_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="STRING">
                <shadow type="text">
                    <field name="TEXT">${apple}</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.length]: (isInitialSetup) =>
    isInitialSetup
      ? ""
      : `
        <block type="operator_length">
            <value name="STRING">
                <shadow type="text">
                    <field name="TEXT">${apple}</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.contains]: (isInitialSetup) =>
    isInitialSetup
      ? ""
      : `
        <block type="operator_contains" id="operator_contains">
            <value name="STRING1">
                <shadow type="text">
                    <field name="TEXT">${apple}</field>
                </shadow>
            </value>
            <value name="STRING2">
                <shadow type="text">
                    <field name="TEXT">${letter}</field>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.mod]: () => `
        <block type="operator_mod">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.round]: () => `
        <block type="operator_round">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
  [OperatorsOpCode.mathop]: () => `
        <block type="operator_mathop">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>`,
};

export const buildOperatorsXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
  showBlocks: Partial<Record<OperatorsOpCode, boolean>> = {},
): string {
  const xml = Object.entries(showBlocks)
    .filter(([, show]) => show)
    .map(([opCode]) => {
      const entry = operatorXmlByOpCode[opCode as OperatorsOpCode];

      return entry(isInitialSetup);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category
        name="%{BKY_CATEGORY_OPERATORS}"
        id="operators"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        ${xml}
        ${categorySeparator}
    </category>
    `;
};
