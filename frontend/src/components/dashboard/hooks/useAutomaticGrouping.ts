import { useCallback } from "react";
import { AxesCriterionType, getAxisAnalysisValue } from "../axes";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { FilterCriterion, matchesFilter } from "../filter";
import { getGroupName } from "./useManualGrouping";
import { jqgram } from "jqgram";
import { match, P } from "ts-pattern";
import { AstNode, AstNodeType } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import { mean } from "../criteria/statistics/mean";
import { AutomaticGroup, SolutionGroupAssignment } from "./grouping";

const separator = "#";

const getName = (...args: string[]): string => args.join(separator);

const lfn = (node: AstNode): string =>
  match(node)
    .returnType<string>()
    .with(P.array({ nodeType: AstNodeType.actor }), () => "root")
    .with({ nodeType: AstNodeType.actor }, (node) => node.nodeType)
    .with({ nodeType: AstNodeType.eventListener }, (node) =>
      getName(node.nodeType, node.condition.event),
    )
    .with({ nodeType: AstNodeType.statement }, (node) =>
      match(node)
        .returnType<string>()
        .with({ statementType: StatementNodeType.assignment }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with({ statementType: StatementNodeType.condition }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with({ statementType: StatementNodeType.functionCall }, (node) =>
          getName(node.nodeType, node.statementType, node.name),
        )
        .with(
          { statementType: StatementNodeType.functionDeclaration },
          (node) =>
            getName(
              node.nodeType,
              node.statementType,
              node.name,
              node.parameterNames.length.toString(),
            ),
        )
        .with({ statementType: StatementNodeType.loop }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with({ statementType: StatementNodeType.sequence }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with(
          { statementType: StatementNodeType.variableDeclaration },
          (node) =>
            getName(
              node.nodeType,
              node.statementType,
              node.name,
              node.type ?? "",
            ),
        )
        .exhaustive(),
    )
    .with({ nodeType: AstNodeType.expression }, (node) =>
      match(node)
        .returnType<string>()
        .with({ expressionType: ExpressionNodeType.functionCall }, (node) =>
          getName(node.nodeType, node.expressionType, node.name),
        )
        .with({ expressionType: ExpressionNodeType.literal }, (node) =>
          getName(node.nodeType, node.expressionType, node.type, node.value),
        )
        .with({ expressionType: ExpressionNodeType.operator }, (node) =>
          getName(node.nodeType, node.expressionType, node.operator),
        )
        .with({ expressionType: ExpressionNodeType.variable }, (node) =>
          getName(node.nodeType, node.expressionType, node.name),
        )
        .exhaustive(),
    )
    .exhaustive();

const cfn = (node: AstNode): AstNode[] =>
  match(node)
    .returnType<AstNode[]>()
    .with(P.array({ nodeType: AstNodeType.actor }), (nodes) => nodes)
    .with({ nodeType: AstNodeType.actor }, (node) => [
      ...node.eventListeners,
      ...node.functionDeclarations,
    ])
    .with({ nodeType: AstNodeType.eventListener }, (node) => [
      node.action,
      ...node.condition.parameters,
    ])
    .with({ nodeType: AstNodeType.statement }, (node) =>
      match(node)
        .returnType<AstNode[]>()
        .with({ statementType: StatementNodeType.assignment }, (node) => [
          node.variable,
          node.value,
        ])
        .with({ statementType: StatementNodeType.condition }, (node) =>
          node.condition
            ? [node.condition, node.whenTrue, node.whenFalse]
            : [node.whenTrue, node.whenFalse],
        )
        .with(
          { statementType: StatementNodeType.functionCall },
          (node) => node.arguments,
        )
        .with(
          { statementType: StatementNodeType.functionDeclaration },
          (node) => [node.body],
        )
        .with({ statementType: StatementNodeType.loop }, (node) =>
          node.condition ? [node.condition, node.body] : [node.body],
        )
        .with(
          { statementType: StatementNodeType.sequence },
          (node) => node.statements,
        )
        .with(
          { statementType: StatementNodeType.variableDeclaration },
          (node) => [node.value],
        )
        .exhaustive(),
    )
    .with({ nodeType: AstNodeType.expression }, (node) =>
      match(node)
        .returnType<AstNode[]>()
        .with(
          { expressionType: ExpressionNodeType.functionCall },
          (node) => node.arguments,
        )
        .with({ expressionType: ExpressionNodeType.literal }, () => [])
        .with(
          { expressionType: ExpressionNodeType.operator },
          (node) => node.operands,
        )
        .with({ expressionType: ExpressionNodeType.variable }, () => [])
        .exhaustive(),
    )
    .exhaustive();

const getInputForNode = (
  a: AstNode,
): {
  root: AstNode;
  lfn: (node: AstNode) => string;
  cfn: (node: AstNode) => AstNode[];
} => ({
  root: a,
  lfn,
  cfn,
});

const computePqDistance = (
  a: AstNode,
  b: AstNode,
  p = 2,
  q = 3,
): Promise<number> =>
  new Promise((resolve) =>
    jqgram.distance(
      getInputForNode(a),
      getInputForNode(b),
      { p, q },
      (result) => resolve(result.distance),
    ),
  );

interface IntermediateGroup {
  solutions: CurrentAnalysis[];
}

const meanDistance = (
  a: IntermediateGroup,
  b: IntermediateGroup,
  distanceMap: Map<number, Map<number, number>>,
): number => {
  let sum = 0;

  for (const solutionA of a.solutions) {
    for (const solutionB of b.solutions) {
      sum +=
        distanceMap.get(solutionA.solutionId)?.get(solutionB.solutionId) ?? 0;
    }
  }

  return sum / (a.solutions.length * b.solutions.length);
};

export const useAutomaticGrouping = (
  isAutomaticGrouping: boolean,
  numberOfGroups: number,
  solutionsInput: CurrentAnalysis[] | undefined,
  filters: FilterCriterion[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): (() => Promise<{
  groupAssignments: SolutionGroupAssignment[];
  automaticGroups: AutomaticGroup[];
}>) =>
  useCallback(async () => {
    const solutions = solutionsInput?.filter((solution) =>
      filters.every((filter) => matchesFilter(filter, solution)),
    );

    if (!solutions || solutions.length === 0 || !isAutomaticGrouping) {
      return { groupAssignments: [], automaticGroups: [] };
    }

    let groups: IntermediateGroup[] = solutions.map((solution) => ({
      solutions: [solution],
    }));

    const distances: Map<number, Map<number, number>> = new Map();
    for (const solution of solutions) {
      distances.set(solution.solutionId, new Map());
    }

    const promises: Promise<void>[] = [];

    for (let i = 0; i < solutions.length; i++) {
      for (let j = i + 1; j < solutions.length; j++) {
        promises.push(
          computePqDistance(
            solutions[i].generalAst,
            solutions[j].generalAst,
          ).then((distance) => {
            distances
              .get(solutions[i].solutionId)!
              .set(solutions[j].solutionId, distance);

            distances
              .get(solutions[j].solutionId)!
              .set(solutions[i].solutionId, distance);
          }),
        );
      }
    }

    await Promise.all(promises);

    while (groups.length > numberOfGroups) {
      let minDistance = Number.POSITIVE_INFINITY;
      const minDistancePair: [number, number] = [-1, -1];

      for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
          const distance = meanDistance(groups[i], groups[j], distances);

          if (distance < minDistance) {
            minDistance = distance;
            minDistancePair[0] = i;
            minDistancePair[1] = j;
          }
        }
      }

      if (minDistancePair[0] < 0 || minDistancePair[1] < 0) {
        break;
      }

      const g1 = groups[minDistancePair[0]];
      const g2 = groups[minDistancePair[1]];

      // merge the two groups with the smallest distance (g1 and g2)
      groups = [
        ...groups.filter((g) => g !== g1 && g !== g2),
        {
          solutions: [...g1.solutions, ...g2.solutions],
        },
      ];
    }

    const groupAssignments: SolutionGroupAssignment[] = [];
    const automaticGroups: AutomaticGroup[] = [];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const key = i.toString();
      const label = getGroupName(i);

      const xAxisValues = group.solutions.map((solution) =>
        getAxisAnalysisValue(xAxis, solution),
      );

      const yAxisValues = group.solutions.map((solution) =>
        getAxisAnalysisValue(yAxis, solution),
      );

      automaticGroups.push({
        key,
        label,
        groupName: label,
        x: mean(xAxisValues),
        y: mean(yAxisValues),
      });

      group.solutions.forEach((solution) =>
        groupAssignments.push({
          groupKey: key,
          solution,
        }),
      );
    }

    return {
      groupAssignments,
      automaticGroups,
    };
  }, [
    isAutomaticGrouping,
    numberOfGroups,
    solutionsInput,
    xAxis,
    yAxis,
    filters,
  ]);
