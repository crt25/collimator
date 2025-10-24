import { ParserRuleContext } from "antlr4";
import {
  isExpressionNode,
  isStatementNode,
} from "src/ast/types/general-ast/helpers/node-type-checks";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  FunctionDeclarationNode,
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { AstNode, AstNodeType } from "src/ast/types/general-ast";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import PythonParserVisitor from "./generated/PythonParserVisitor";
import {
  Annotated_rhsContext,
  AnnotationContext,
  As_patternContext,
  Assert_stmtContext,
  AssignmentContext,
  Assignment_expressionContext,
  AtomContext,
  Await_primaryContext,
  Bitwise_andContext,
  Bitwise_orContext,
  Bitwise_xorContext,
  BlockContext,
  Capture_patternContext,
  Case_blockContext,
  Class_defContext,
  Class_patternContext,
  Closed_patternContext,
  ComparisonContext,
  Complex_numberContext,
  Compound_stmtContext,
  ConjunctionContext,
  DecoratorsContext,
  Default_assignmentContext,
  Del_stmtContext,
  Del_t_atomContext,
  Del_targetContext,
  Del_targetsContext,
  DictContext,
  DictcompContext,
  DisjunctionContext,
  Double_star_patternContext,
  Double_starred_kvpairContext,
  Double_starred_kvpairsContext,
  Elif_stmtContext,
  Else_blockContext,
  EvalContext,
  Except_blockContext,
  Except_star_blockContext,
  ExpressionContext,
  ExpressionsContext,
  FactorContext,
  File_inputContext,
  Finally_blockContext,
  For_if_clauseContext,
  For_if_clausesContext,
  For_stmtContext,
  FstringContext,
  Fstring_conversionContext,
  Fstring_format_specContext,
  Fstring_full_format_specContext,
  Fstring_middleContext,
  Fstring_replacement_fieldContext,
  Func_typeContext,
  Func_type_commentContext,
  Function_defContext,
  GenexpContext,
  Global_stmtContext,
  GroupContext,
  Group_patternContext,
  GuardContext,
  If_stmtContext,
  Imaginary_numberContext,
  Import_stmtContext,
  InteractiveContext,
  InversionContext,
  Items_patternContext,
  Key_value_patternContext,
  Keyword_patternContext,
  Keyword_patternsContext,
  KvpairContext,
  LambdefContext,
  ListContext,
  ListcompContext,
  Literal_exprContext,
  Literal_patternContext,
  Mapping_patternContext,
  Match_stmtContext,
  Maybe_sequence_patternContext,
  Maybe_star_patternContext,
  Named_expressionContext,
  Nonlocal_stmtContext,
  Open_sequence_patternContext,
  Or_patternContext,
  PatternContext,
  Pattern_capture_targetContext,
  PatternsContext,
  Positional_patternsContext,
  PowerContext,
  PrimaryContext,
  Raise_stmtContext,
  Real_numberContext,
  Return_stmtContext,
  Sequence_patternContext,
  SetContext,
  SetcompContext,
  Shift_exprContext,
  Signed_numberContext,
  Signed_real_numberContext,
  Simple_stmtContext,
  Simple_stmtsContext,
  Single_subscript_attribute_targetContext,
  Single_targetContext,
  SliceContext,
  SlicesContext,
  Star_annotationContext,
  Star_atomContext,
  Star_expressionContext,
  Star_expressionsContext,
  Star_named_expressionContext,
  Star_named_expressionsContext,
  Star_patternContext,
  Star_targetContext,
  Star_targetsContext,
  Star_targets_list_seqContext,
  Star_targets_tuple_seqContext,
  Starred_expressionContext,
  StatementContext,
  Statement_newlineContext,
  StatementsContext,
  StringContext,
  StringsContext,
  Subject_exprContext,
  SumContext,
  T_primaryContext,
  Target_with_star_atomContext,
  TermContext,
  Try_stmtContext,
  TupleContext,
  Type_aliasContext,
  Type_expressionsContext,
  Type_param_boundContext,
  Type_param_defaultContext,
  Type_param_starred_defaultContext,
  Value_patternContext,
  While_stmtContext,
  Wildcard_patternContext,
  With_itemContext,
  With_stmtContext,
  Yield_exprContext,
  Yield_stmtContext,
} from "./generated/PythonParser";

// expressions converters
import { convertSubjectExpr } from "./nodes/expressions/subject-expr";
import { convertLiteralExpression } from "./nodes/expressions/literal";
import { convertComplexNumber } from "./nodes/expressions/complex-number";
import { convertSignedNumber } from "./nodes/expressions/signed-number";
import { convertSignedRealNumber } from "./nodes/expressions/signed-real-number";
import { convertRealNumber } from "./nodes/expressions/real-number";
import { convertImaginaryNumber } from "./nodes/expressions/imaginary-number";
import { convertExpressions } from "./nodes/expressions/expressions";
import { convertExpression } from "./nodes/expressions/expression";
import { convertYieldExpr } from "./nodes/expressions/yield-expr";
import { convertStarExpressions } from "./nodes/expressions/star-expressions";
import { convertStarExpression } from "./nodes/expressions/star-expression";
import { convertStarNamedExpressions } from "./nodes/expressions/star-named-expressions";
import { convertStarNamedExpression } from "./nodes/expressions/star-named-expression";
import { convertAssignmentExpression } from "./nodes/expressions/assignment-expression";
import { convertNamedExpression } from "./nodes/expressions/named-expression";
import { convertDisjunction } from "./nodes/expressions/disjunction";
import { convertConjunction } from "./nodes/expressions/conjunction";
import { convertInversion } from "./nodes/expressions/inversion";
import { convertComparison } from "./nodes/expressions/comparison";
import { convertBitwiseOr } from "./nodes/expressions/bitwise-or";
import { convertBitwiseXor } from "./nodes/expressions/bitwise-xor";
import { convertBitwiseAnd } from "./nodes/expressions/bitwise-and";
import { convertShiftExpr } from "./nodes/expressions/shift-expr";
import { convertSum } from "./nodes/expressions/sum";
import { convertTerm } from "./nodes/expressions/term";
import { convertFactor } from "./nodes/expressions/factor";
import { convertPower } from "./nodes/expressions/power";
import { convertAwaitPrimary } from "./nodes/expressions/await-primary";
import { convertPrimary } from "./nodes/expressions/primary";
import { convertSlices } from "./nodes/expressions/slices";
import { convertSlice } from "./nodes/expressions/slice";
import { convertAtom } from "./nodes/expressions/atom";
import { convertGroup } from "./nodes/expressions/group";
import { convertLambdef } from "./nodes/expressions/lambdef";
import { convertFstringMiddle } from "./nodes/expressions/fstring-middle";
import { convertFstringReplacementField } from "./nodes/expressions/fstring-replacement-field";
import { convertFstringConversion } from "./nodes/expressions/fstring-conversion";
import { convertFstringFullFormatSpec } from "./nodes/expressions/fstring-full-format-spec";
import { convertFstringFormatSpec } from "./nodes/expressions/fstring-format-spec";
import { convertFstring } from "./nodes/expressions/fstring";
import { convertString } from "./nodes/expressions/string";
import { convertStrings } from "./nodes/expressions/strings";
import { convertList } from "./nodes/expressions/list";
import { convertTuple } from "./nodes/expressions/tuple";
import { convertSet } from "./nodes/expressions/set";
import { convertDict } from "./nodes/expressions/dict";
import { convertDoubleStarredKvpairs } from "./nodes/expressions/double-starred-kvpairs";
import { convertDoubleStarredKvpair } from "./nodes/expressions/double-starred-kvpair";
import { convertKvpair } from "./nodes/expressions/kvpair";
import { convertForIfClauses } from "./nodes/expressions/for-if-clauses";
import { convertForIfClause } from "./nodes/expressions/for-if-clause";
import { convertListComprehension } from "./nodes/expressions/list-comprehension";
import { convertSetComprehension } from "./nodes/expressions/set-comprehension";
import { convertGenexp } from "./nodes/expressions/genexp";
import { convertDictComprehension } from "./nodes/expressions/dict-comprehension";
import { convertStarredExpression } from "./nodes/expressions/starred-expression";

// imports converters
import { convertImportStmt } from "./nodes/imports/import-stmt";

// misc converters
import { convertFileInput } from "./nodes/misc/file-input";
import { convertInteractive } from "./nodes/misc/interactive";
import { convertEval } from "./nodes/misc/eval";
import { convertDecorators } from "./nodes/misc/decorators";
import { convertStarTargets } from "./nodes/misc/star-targets";
import { convertStarTargetsListSeq } from "./nodes/misc/star-targets-list-seq";
import { convertStarTargetsTupleSeq } from "./nodes/misc/star-targets-tuple-seq";
import { convertStarTarget } from "./nodes/misc/star-target";
import { convertTargetWithStarAtom } from "./nodes/misc/target-with-star-atom";
import { convertStarAtom } from "./nodes/misc/star-atom";
import { convertSingleTarget } from "./nodes/misc/single-target";
import { convertSingleSubscriptAttributeTarget } from "./nodes/misc/single-subscript-attribute-target";
import { convertTargetPrimary } from "./nodes/misc/target-primary";
import { convertDeleteTargets } from "./nodes/misc/delete-targets";
import { convertDeleteTarget } from "./nodes/misc/delete-target";
import { convertDeleteTargetAtom } from "./nodes/misc/delete-target-atom";

// parameters converters
import { convertDefaultAssignment } from "./nodes/parameters/default-assignment";

// patterns converters
import { convertGuard } from "./nodes/patterns/guard";
import { convertPatterns } from "./nodes/patterns/patterns";
import { convertPattern } from "./nodes/patterns/pattern";
import { convertAsPattern } from "./nodes/patterns/as-pattern";
import { convertOrPattern } from "./nodes/patterns/or-pattern";
import { convertClosedPattern } from "./nodes/patterns/closed-pattern";
import { convertLiteralPattern } from "./nodes/patterns/literal-pattern";
import { convertCapturePattern } from "./nodes/patterns/capture-pattern";
import { convertPatternCaptureTarget } from "./nodes/patterns/pattern-capture-target";
import { convertWildcardPattern } from "./nodes/patterns/wildcard-pattern";
import { convertValuePattern } from "./nodes/patterns/value-pattern";
import { convertGroupPattern } from "./nodes/patterns/group-pattern";
import { convertSequencePattern } from "./nodes/patterns/sequence-pattern";
import { convertOpenSequencePattern } from "./nodes/patterns/open-sequence-pattern";
import { convertMaybeSequencePattern } from "./nodes/patterns/maybe-sequence-pattern";
import { convertMaybeStarPattern } from "./nodes/patterns/maybe-star-pattern";
import { convertStarPattern } from "./nodes/patterns/star-pattern";
import { convertMappingPattern } from "./nodes/patterns/mapping-pattern";
import { convertItemsPattern } from "./nodes/patterns/items-pattern";
import { convertKeyValuePattern } from "./nodes/patterns/key-value-pattern";
import { convertDoubleStarPattern } from "./nodes/patterns/double-star-pattern";
import { convertClassPattern } from "./nodes/patterns/class-pattern";
import { convertPositionalPatterns } from "./nodes/patterns/positional-patterns";
import { convertKeywordPatterns } from "./nodes/patterns/keyword-patterns";
import { convertKeywordPattern } from "./nodes/patterns/keyword-pattern";

// statements converters
import { convertStatements } from "./nodes/statements/statements";
import { convertStatement } from "./nodes/statements/statement";
import { convertStatementNewline } from "./nodes/statements/statement-newline";
import { convertSimpleStmts } from "./nodes/statements/simple-stmts";
import { convertSimpleStmt } from "./nodes/statements/simple-stmt";
import { convertCompoundStmt } from "./nodes/statements/compound-stmt";
import { convertAssignment } from "./nodes/statements/assignment";
import { convertAnnotatedRhs } from "./nodes/expressions/annotated-rhs";
import { convertReturnStmt } from "./nodes/statements/return-stmt";
import { convertRaiseStmt } from "./nodes/statements/raise-stmt";
import { convertGlobalStmt } from "./nodes/statements/global-stmt";
import { convertNonlocalStmt } from "./nodes/statements/nonlocal-stmt";
import { convertDelStmt } from "./nodes/statements/del-stmt";
import { convertYieldStmt } from "./nodes/statements/yield-stmt";
import { convertAssertStmt } from "./nodes/statements/assert-stmt";
import { convertBlock } from "./nodes/statements/block";
import { convertClassDef } from "./nodes/statements/class-def";
import { convertFunctionDef } from "./nodes/statements/function-def";
import { convertIfStmt } from "./nodes/statements/if-stmt";
import { convertElifStmt } from "./nodes/statements/elif-stmt";
import { convertElseBlock } from "./nodes/statements/else-block";
import { convertWhileStmt } from "./nodes/statements/while-stmt";
import { convertForStmt } from "./nodes/statements/for-stmt";
import { convertWithStmt } from "./nodes/statements/with-stmt";
import { convertWithItem } from "./nodes/statements/with-item";
import { convertTryStmt } from "./nodes/statements/try-stmt";
import { convertExceptBlock } from "./nodes/statements/except-block";
import { convertExceptStarBlock } from "./nodes/statements/except-star-block";
import { convertFinallyBlock } from "./nodes/statements/finally-block";
import { convertMatchStmt } from "./nodes/statements/match-stmt";
import { convertCaseBlock } from "./nodes/statements/case-block";

// types converters
import { convertFuncType } from "./nodes/types/func-type";
import { convertAnnotation } from "./nodes/types/annotation";
import { convertStarAnnotation } from "./nodes/types/star-annotation";
import { convertTypeAlias } from "./nodes/types/type-alias";
import { convertTypeParamBound } from "./nodes/types/type-param-bound";
import { convertTypeParamDefault } from "./nodes/types/type-param-default";
import { convertTypeParamStarredDefault } from "./nodes/types/type-param-starred-default";
import { convertTypeExpressions } from "./nodes/types/type-expressions";
import { convertFuncTypeComment } from "./nodes/types/func-type-comment";
import { PythonVisitorReturnValue } from "./python-ast-visitor-return-value";
import { UnexpectedResultError } from "./nodes/unexpected-result-error";
import { IPythonAstVisitor } from "./python-ast-visitor-interface";

export class PythonAstVisitor
  extends PythonParserVisitor<PythonVisitorReturnValue>
  implements IPythonAstVisitor
{
  getExpression(
    ctx: ParserRuleContext,
  ): PythonVisitorReturnValue & { node: ExpressionNode } {
    const result = this.visit(ctx);

    if (!isExpressionNode(result.node)) {
      throw UnexpectedResultError.unexpectedNonExpression(result);
    }

    return result as PythonVisitorReturnValue & { node: ExpressionNode };
  }

  getExpressions(ctxs?: ParserRuleContext[]): {
    nodes: ExpressionNode[];
    functionDeclarations: FunctionDeclarationNode[];
  } {
    const results = (ctxs ?? [])
      .filter((ctx) => ctx instanceof ParserRuleContext)
      .map((ctx) => this.getExpression(ctx));

    return {
      nodes: results.map((r) => r.node),
      functionDeclarations: results.flatMap((r) => r.functionDeclarations),
    };
  }

  getStatementSequence = (
    children: (ParserRuleContext | undefined)[],
  ): PythonVisitorReturnValue & {
    node: StatementSequenceNode;
  } => {
    const childValues = children
      .filter((c) => c !== undefined)
      .map((child) => this.visit(child));

    const nodes = childValues.flatMap((v) => {
      if (
        isStatementNode(v.node) &&
        v.node.statementType === StatementNodeType.sequence
      ) {
        // flatten sequences
        return v.node.statements as AstNode[];
      }

      // ignore undefined nodes, i.e. ones that only return function declarations here
      // and collect the function declarations
      return v.node ?? [];
    });
    const functionDeclarations = childValues.flatMap(
      (v) => v.functionDeclarations,
    );

    const statementNodes = nodes.filter(isStatementNode);
    if (statementNodes.length !== nodes.length) {
      const nonStatementNodes = childValues.filter(
        (c) => !isStatementNode(c.node),
      );

      throw new Error(
        `File input can only contain statement nodes. Found non-statement nodes: ${JSON.stringify(nonStatementNodes)}`,
      );
    }

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.sequence,
        statements: statementNodes,
      } satisfies StatementSequenceNode,
      functionDeclarations,
    };
  };

  getStatements = (
    children: (ParserRuleContext | undefined)[],
  ): PythonVisitorReturnValue & {
    node: StatementNode;
  } => {
    const { node, functionDeclarations } = this.getStatementSequence(children);

    if (node.statements.length === 1) {
      return {
        node: node.statements[0],
        functionDeclarations,
      };
    }

    return { node, functionDeclarations };
  };

  visitChildren(ctx: ParserRuleContext): PythonVisitorReturnValue {
    if (ctx instanceof File_inputContext) {
      return convertFileInput(this, ctx);
    } else if (ctx instanceof InteractiveContext) {
      return convertInteractive(this, ctx);
    } else if (ctx instanceof EvalContext) {
      return convertEval(this, ctx);
    } else if (ctx instanceof Func_typeContext) {
      return convertFuncType(this, ctx);
    } else if (ctx instanceof StatementsContext) {
      return convertStatements(this, ctx);
    } else if (ctx instanceof StatementContext) {
      return convertStatement(this, ctx);
    } else if (ctx instanceof Statement_newlineContext) {
      return convertStatementNewline(this, ctx);
    } else if (ctx instanceof Simple_stmtsContext) {
      return convertSimpleStmts(this, ctx);
    } else if (ctx instanceof Simple_stmtContext) {
      return convertSimpleStmt(this, ctx);
    } else if (ctx instanceof Compound_stmtContext) {
      return convertCompoundStmt(this, ctx);
    } else if (ctx instanceof AssignmentContext) {
      return convertAssignment(this, ctx);
    } else if (ctx instanceof Annotated_rhsContext) {
      return convertAnnotatedRhs(this, ctx);
    } else if (ctx instanceof Return_stmtContext) {
      return convertReturnStmt(this, ctx);
    } else if (ctx instanceof Raise_stmtContext) {
      return convertRaiseStmt(this, ctx);
    } else if (ctx instanceof Global_stmtContext) {
      return convertGlobalStmt(this, ctx);
    } else if (ctx instanceof Nonlocal_stmtContext) {
      return convertNonlocalStmt(this, ctx);
    } else if (ctx instanceof Del_stmtContext) {
      return convertDelStmt(this, ctx);
    } else if (ctx instanceof Yield_stmtContext) {
      return convertYieldStmt(this, ctx);
    } else if (ctx instanceof Assert_stmtContext) {
      return convertAssertStmt(this, ctx);
    } else if (ctx instanceof Import_stmtContext) {
      return convertImportStmt(this, ctx);
    } else if (ctx instanceof BlockContext) {
      return convertBlock(this, ctx);
    } else if (ctx instanceof DecoratorsContext) {
      return convertDecorators(this, ctx);
    } else if (ctx instanceof Class_defContext) {
      return convertClassDef(this, ctx);
    } else if (ctx instanceof Function_defContext) {
      return convertFunctionDef(this, ctx);
    } else if (ctx instanceof AnnotationContext) {
      return convertAnnotation(this, ctx);
    } else if (ctx instanceof Star_annotationContext) {
      return convertStarAnnotation(this, ctx);
    } else if (ctx instanceof Default_assignmentContext) {
      return convertDefaultAssignment(this, ctx);
    } else if (ctx instanceof If_stmtContext) {
      return convertIfStmt(this, ctx);
    } else if (ctx instanceof Elif_stmtContext) {
      return convertElifStmt(this, ctx);
    } else if (ctx instanceof Else_blockContext) {
      return convertElseBlock(this, ctx);
    } else if (ctx instanceof While_stmtContext) {
      return convertWhileStmt(this, ctx);
    } else if (ctx instanceof For_stmtContext) {
      return convertForStmt(this, ctx);
    } else if (ctx instanceof With_stmtContext) {
      return convertWithStmt(this, ctx);
    } else if (ctx instanceof With_itemContext) {
      return convertWithItem(this, ctx);
    } else if (ctx instanceof Try_stmtContext) {
      return convertTryStmt(this, ctx);
    } else if (ctx instanceof Except_blockContext) {
      return convertExceptBlock(this, ctx);
    } else if (ctx instanceof Except_star_blockContext) {
      return convertExceptStarBlock(this, ctx);
    } else if (ctx instanceof Finally_blockContext) {
      return convertFinallyBlock(this, ctx);
    } else if (ctx instanceof Match_stmtContext) {
      return convertMatchStmt(this, ctx);
    } else if (ctx instanceof Subject_exprContext) {
      return convertSubjectExpr(this, ctx);
    } else if (ctx instanceof Case_blockContext) {
      return convertCaseBlock(this, ctx);
    } else if (ctx instanceof GuardContext) {
      return convertGuard(this, ctx);
    } else if (ctx instanceof PatternsContext) {
      return convertPatterns(this, ctx);
    } else if (ctx instanceof PatternContext) {
      return convertPattern(this, ctx);
    } else if (ctx instanceof As_patternContext) {
      return convertAsPattern(this, ctx);
    } else if (ctx instanceof Or_patternContext) {
      return convertOrPattern(this, ctx);
    } else if (ctx instanceof Closed_patternContext) {
      return convertClosedPattern(this, ctx);
    } else if (ctx instanceof Literal_patternContext) {
      return convertLiteralPattern(this, ctx);
    } else if (ctx instanceof Literal_exprContext) {
      return convertLiteralExpression(this, ctx);
    } else if (ctx instanceof Complex_numberContext) {
      return convertComplexNumber(this, ctx);
    } else if (ctx instanceof Signed_numberContext) {
      return convertSignedNumber(this, ctx);
    } else if (ctx instanceof Signed_real_numberContext) {
      return convertSignedRealNumber(this, ctx);
    } else if (ctx instanceof Real_numberContext) {
      return convertRealNumber(this, ctx);
    } else if (ctx instanceof Imaginary_numberContext) {
      return convertImaginaryNumber(this, ctx);
    } else if (ctx instanceof Capture_patternContext) {
      return convertCapturePattern(this, ctx);
    } else if (ctx instanceof Pattern_capture_targetContext) {
      return convertPatternCaptureTarget(this, ctx);
    } else if (ctx instanceof Wildcard_patternContext) {
      return convertWildcardPattern(this, ctx);
    } else if (ctx instanceof Value_patternContext) {
      return convertValuePattern(this, ctx);
    } else if (ctx instanceof Group_patternContext) {
      return convertGroupPattern(this, ctx);
    } else if (ctx instanceof Sequence_patternContext) {
      return convertSequencePattern(this, ctx);
    } else if (ctx instanceof Open_sequence_patternContext) {
      return convertOpenSequencePattern(this, ctx);
    } else if (ctx instanceof Maybe_sequence_patternContext) {
      return convertMaybeSequencePattern(this, ctx);
    } else if (ctx instanceof Maybe_star_patternContext) {
      return convertMaybeStarPattern(this, ctx);
    } else if (ctx instanceof Star_patternContext) {
      return convertStarPattern(this, ctx);
    } else if (ctx instanceof Mapping_patternContext) {
      return convertMappingPattern(this, ctx);
    } else if (ctx instanceof Items_patternContext) {
      return convertItemsPattern(this, ctx);
    } else if (ctx instanceof Key_value_patternContext) {
      return convertKeyValuePattern(this, ctx);
    } else if (ctx instanceof Double_star_patternContext) {
      return convertDoubleStarPattern(this, ctx);
    } else if (ctx instanceof Class_patternContext) {
      return convertClassPattern(this, ctx);
    } else if (ctx instanceof Positional_patternsContext) {
      return convertPositionalPatterns(this, ctx);
    } else if (ctx instanceof Keyword_patternsContext) {
      return convertKeywordPatterns(this, ctx);
    } else if (ctx instanceof Keyword_patternContext) {
      return convertKeywordPattern(this, ctx);
    } else if (ctx instanceof Type_aliasContext) {
      return convertTypeAlias(this, ctx);
    } else if (ctx instanceof Type_param_boundContext) {
      return convertTypeParamBound(this, ctx);
    } else if (ctx instanceof Type_param_defaultContext) {
      return convertTypeParamDefault(this, ctx);
    } else if (ctx instanceof Type_param_starred_defaultContext) {
      return convertTypeParamStarredDefault(this, ctx);
    } else if (ctx instanceof ExpressionsContext) {
      return convertExpressions(this, ctx);
    } else if (ctx instanceof ExpressionContext) {
      return convertExpression(this, ctx);
    } else if (ctx instanceof Yield_exprContext) {
      return convertYieldExpr(this, ctx);
    } else if (ctx instanceof Star_expressionsContext) {
      return convertStarExpressions(this, ctx);
    } else if (ctx instanceof Star_expressionContext) {
      return convertStarExpression(this, ctx);
    } else if (ctx instanceof Star_named_expressionsContext) {
      return convertStarNamedExpressions(this, ctx);
    } else if (ctx instanceof Star_named_expressionContext) {
      return convertStarNamedExpression(this, ctx);
    } else if (ctx instanceof Assignment_expressionContext) {
      return convertAssignmentExpression(this, ctx);
    } else if (ctx instanceof Named_expressionContext) {
      return convertNamedExpression(this, ctx);
    } else if (ctx instanceof DisjunctionContext) {
      return convertDisjunction(this, ctx);
    } else if (ctx instanceof ConjunctionContext) {
      return convertConjunction(this, ctx);
    } else if (ctx instanceof InversionContext) {
      return convertInversion(this, ctx);
    } else if (ctx instanceof ComparisonContext) {
      return convertComparison(this, ctx);
    } else if (ctx instanceof Bitwise_orContext) {
      return convertBitwiseOr(this, ctx);
    } else if (ctx instanceof Bitwise_xorContext) {
      return convertBitwiseXor(this, ctx);
    } else if (ctx instanceof Bitwise_andContext) {
      return convertBitwiseAnd(this, ctx);
    } else if (ctx instanceof Shift_exprContext) {
      return convertShiftExpr(this, ctx);
    } else if (ctx instanceof SumContext) {
      return convertSum(this, ctx);
    } else if (ctx instanceof TermContext) {
      return convertTerm(this, ctx);
    } else if (ctx instanceof FactorContext) {
      return convertFactor(this, ctx);
    } else if (ctx instanceof PowerContext) {
      return convertPower(this, ctx);
    } else if (ctx instanceof Await_primaryContext) {
      return convertAwaitPrimary(this, ctx);
    } else if (ctx instanceof PrimaryContext) {
      return convertPrimary(this, ctx);
    } else if (ctx instanceof SlicesContext) {
      return convertSlices(this, ctx);
    } else if (ctx instanceof SliceContext) {
      return convertSlice(this, ctx);
    } else if (ctx instanceof AtomContext) {
      return convertAtom(this, ctx);
    } else if (ctx instanceof GroupContext) {
      return convertGroup(this, ctx);
    } else if (ctx instanceof LambdefContext) {
      return convertLambdef(this, ctx);
    } else if (ctx instanceof Fstring_middleContext) {
      return convertFstringMiddle(this, ctx);
    } else if (ctx instanceof Fstring_replacement_fieldContext) {
      return convertFstringReplacementField(this, ctx);
    } else if (ctx instanceof Fstring_conversionContext) {
      return convertFstringConversion(this, ctx);
    } else if (ctx instanceof Fstring_full_format_specContext) {
      return convertFstringFullFormatSpec(this, ctx);
    } else if (ctx instanceof Fstring_format_specContext) {
      return convertFstringFormatSpec(this, ctx);
    } else if (ctx instanceof FstringContext) {
      return convertFstring(this, ctx);
    } else if (ctx instanceof StringContext) {
      return convertString(this, ctx);
    } else if (ctx instanceof StringsContext) {
      return convertStrings(this, ctx);
    } else if (ctx instanceof ListContext) {
      return convertList(this, ctx);
    } else if (ctx instanceof TupleContext) {
      return convertTuple(this, ctx);
    } else if (ctx instanceof SetContext) {
      return convertSet(this, ctx);
    } else if (ctx instanceof DictContext) {
      return convertDict(this, ctx);
    } else if (ctx instanceof Double_starred_kvpairsContext) {
      return convertDoubleStarredKvpairs(this, ctx);
    } else if (ctx instanceof Double_starred_kvpairContext) {
      return convertDoubleStarredKvpair(this, ctx);
    } else if (ctx instanceof KvpairContext) {
      return convertKvpair(this, ctx);
    } else if (ctx instanceof For_if_clausesContext) {
      return convertForIfClauses(this, ctx);
    } else if (ctx instanceof For_if_clauseContext) {
      return convertForIfClause(this, ctx);
    } else if (ctx instanceof ListcompContext) {
      return convertListComprehension(this, ctx);
    } else if (ctx instanceof SetcompContext) {
      return convertSetComprehension(this, ctx);
    } else if (ctx instanceof GenexpContext) {
      return convertGenexp(this, ctx);
    } else if (ctx instanceof DictcompContext) {
      return convertDictComprehension(this, ctx);
    } else if (ctx instanceof Starred_expressionContext) {
      return convertStarredExpression(this, ctx);
    } else if (ctx instanceof Star_targetsContext) {
      return convertStarTargets(this, ctx);
    } else if (ctx instanceof Star_targets_list_seqContext) {
      return convertStarTargetsListSeq(this, ctx);
    } else if (ctx instanceof Star_targets_tuple_seqContext) {
      return convertStarTargetsTupleSeq(this, ctx);
    } else if (ctx instanceof Star_targetContext) {
      return convertStarTarget(this, ctx);
    } else if (ctx instanceof Target_with_star_atomContext) {
      return convertTargetWithStarAtom(this, ctx);
    } else if (ctx instanceof Star_atomContext) {
      return convertStarAtom(this, ctx);
    } else if (ctx instanceof Single_targetContext) {
      return convertSingleTarget(this, ctx);
    } else if (ctx instanceof Single_subscript_attribute_targetContext) {
      return convertSingleSubscriptAttributeTarget(this, ctx);
    } else if (ctx instanceof T_primaryContext) {
      return convertTargetPrimary(this, ctx);
    } else if (ctx instanceof Del_targetsContext) {
      return convertDeleteTargets(this, ctx);
    } else if (ctx instanceof Del_targetContext) {
      return convertDeleteTarget(this, ctx);
    } else if (ctx instanceof Del_t_atomContext) {
      return convertDeleteTargetAtom(this, ctx);
    } else if (ctx instanceof Type_expressionsContext) {
      return convertTypeExpressions(this, ctx);
    } else if (ctx instanceof Func_type_commentContext) {
      return convertFuncTypeComment(this, ctx);
    } else {
      throw new Error(`Unexpected AST node type: ${ctx.constructor.name}`);
    }
  }
}
