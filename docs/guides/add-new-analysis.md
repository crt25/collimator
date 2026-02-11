# How to add new analysis logic

To provide a scalable system with minimal server resource usage, all analysis is performed client-side, in the `frontend` application.

## Overview

A new analysis logic can be one of the following:

- An analyzer, based on an AST or meta criteria;
- A solution grouping, either automatic or manual.

This document guides you through the process of adding these additional types of analyses.

## Criteria-based analyzer

Criteria-based analyzers are located in `frontend/src/data-analyzer/criteria-based-analyzers`.

As an example, a simple analyzer that counts the number of condition statements in the [G-AST](../data-analyzer/ast-conversion.md) may look like this:

```typescript
export const countConditions = (
  ast: GeneralAst,
  input: CriteriaBasedAnalyzerInput[AstCriterionType.condition]
): CriteriaBasedAnalyzerOutput[AstCriterionType.condition] => {
  let count = 0;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.condition) {
        count++;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return count;
};
```

Here, `walkAst` is a utility function that recursively walks the AST and calls `statementCallback` for each statement node.

The enum `AstCriterionType`, as well as the types `CriteriaBasedAnalyzerInput` and `CriteriaBasedAnalyzerOutput`, are defined in `frontend/src/data-analyzer/analyze-asts.ts`.

This file also defines the global `analyzeAst` function. Given a G-AST and a criterion input, this function runs the corresponding analyzer and returns its output.

In `frontend/src/components/dashboard/criteria` the `analyzeAst` function is used for:

1. Axes
2. Filters

### Adding a new AST criterion

To add a new AST-based criterion, you must:

1. Add your criterion to the `AstCriterionType` enum and the types `CriteriaBasedAnalyzerInput`, `CriteriaBasedAnalyzerOutput`, `AnalysisFunction` in `frontend/src/data-analyzer/analyze-asts.ts`.
2. Create a new analyzer in `frontend/src/data-analyzer/criteria-based-analyzers` and extend the `analyzeAst` function in `frontend/src/data-analyzer/analyze-asts.ts`.
3. Use the analyzer in an axis or a filter, as described below.

### Adding a new meta criterion

If your criterion is not related to the AST, you must:

1. Add your criterion to `MetaCriterionType` in `frontend/src/data-analyzer/meta-criterion-type.ts`.
2. Define an axis or a filter, as described below.

### Axis

To use a criterion as an axis in the analyzer, you must define an instance of `CriterionAxisDefinition<>` in `frontend/src/components/dashboard/criteria`.

For the example that counts condition statements, this may look like:

```typescript
export const ConditionCriterionAxis: CriterionAxisDefinition<AstCriterionType.condition> =
  {
    // Which criterion this axis is for
    criterion: AstCriterionType.condition,

    // A function that, given the task type, returns the name of the axis
    messages: (taskType) =>
      defineMessages({
        name: {
          id: "criteria.condition.name",
          defaultMessage: "If",
        },
      }),

    // A chart.js axis configuration
    config: {
      type: "linear",
      ticks: {
        precision: 0,
      },
    },

    // Returns the axis value for a given analysis
    getAxisValue: (analysis) => {
      const numberOfConditions = analyzeAst(analysis.generalAst, {
        criterion,
        input: undefined,
      }).output;

      return numberOfConditions;
    },
  };
```

Note: For axes, it is currently not possible to provide additional input parameters.

#### Adding a new axis

To add a new axis, you must:

1. Define a new `CriterionAxisDefinition` in `frontend/src/components/dashboard/criteria`.
2. Add it to the `axisCriteria` list in `frontend/src/components/dashboard/axes/index.ts`.

### Filter

To use a criterion as a filter, you must define an instance of `CriterionFilterDefinition<>` in `frontend/src/components/dashboard/criteria`.

For the example that counts condition statements, this may look like:

```typescript
export const ConditionCriterionFilter: CriterionFilterDefinition<
  AstCriterionType.condition,
  ConditionFilterCriterion,
  ConditionFilterCriterionParameters
> = {
  // Which criterion is this filter for
  criterion: AstCriterionType.condition,

  // A CriterionFormComponent accepting the properties 'value', 'onChange' and 'parameters'
  formComponent: ConditionCriterionFilterForm,

  // A function that, given the task type, returns the name of the filter
  messages: (taskType) =>
    defineMessages({
      name: {
        id: "criteria.condition.name",
        defaultMessage: "If",
      },
    }),

  // The initial values used for the parameters
  // that are passed to the filter component.
  initialValues: {
    criterion: AstCriterionType.condition,
    minimumCount: 0,
    maximumCount: 100,
  },

  // The function which runs the filter on a set of analyses.
  run: (config, analyses) => {
    const numberOfConditionsList = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output
    );

    return {
      // List of booleans corresponding to whether the filter
      // matched a given analysis.
      matchesFilter: numberOfConditionsList.map(
        (numberOfConditions) =>
          config.minimumCount <= numberOfConditions &&
          config.maximumCount >= numberOfConditions
      ),

      // The new parameters that should be passed to the filter component
      parameters: {
        criterion: AstCriterionType.condition,
        minNumberOfConditions: Math.min(...numberOfConditionsList),
        maxNumberOfConditions: Math.max(...numberOfConditionsList),
      },
    };
  },
};
```

The corresponding filter component may look like:

```typescript
const ConditionCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.condition,
  ConditionFilterCriterion,
  ConditionFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minNumberOfConditions, maxNumberOfConditions },
}) => (
  <form data-testid="condition-filter-form">
    <MinMaxRange
      min={minNumberOfConditions}
      max={maxNumberOfConditions}
      valueMin={value.minimumCount}
      valueMax={value.maximumCount}
      onChange={(min, max) =>
        onChange({
          ...value,
          minimumCount: min,
          maximumCount: max,
        })
      }
    />
  </form>
);
```

#### Adding a new filter

To add a new filter, you must:

1. Define a new `CriterionFilterDefinition` and `CriterionFormComponent` in `frontend/src/components/dashboard/criteria`.
2. Add it to the `filterCriteria` list in `frontend/src/components/dashboard/filter/index.ts`.
3. Extend the component `CriterionFilterForm` in `frontend/src/components/dashboard/filter/CriterionFilterForm.tsx` to support your new filter form.

## Solution grouping

The `Analyzer` component provides all grouping functionality by relying on the `useGrouping` hook located at `src/components/dashboard/hooks/useGrouping.ts`.

The hook accepts, among others:

- The set of analyzed solutions to group
- The current `x` and `y` axes
- The manually defined `splits` (vertical and horizontal lines)
- The boolean flag `isAutomaticGrouping`.

### Manual grouping

When `isAutomaticGrouping` is `false`, groups are computed based on the (manually provided) vertical and horizontal split lines as well as the currently selected axes.

This logic is implemented in `src/components/dashboard/hooks/useManualGrouping.ts`.

To modify manual grouping behavior, update this file.

### Automatic grouping (Machine Learning / AI)

When `isAutomaticGrouping` is `true`, grouping is handled by `useAutomaticGrouping` hook, located at `src/components/dashboard/hooks/useAutomaticGrouping.ts`.

This hook relies on `getAutomaticGroups`, which accepts:

- The set of analyzed solutions,
- An `AutomaticGroupingType` enum (algorithm selection)
- A `DistanceType` enum (distance metric selection)

#### Adding a new grouping algorithm

To add a new algorithm for automatic grouping, you must:

1. Add a new value to the `AutomaticGroupingType` enum defined in `src/components/dashboard/hooks/automatic-grouping/grouping-type.ts`.
2. Create a new file in `src/components/dashboard/hooks/automatic-grouping/`
3. Implement a function with the signature

   ```typescript
   (analyses: CurrentAnalysis[], distanceType: DistanceType): Promise<AnalysisGroup[]>
   ```

   If your algorithm does not rely on a distance metric, consider [adding a custom `None` distance metric](#how-to-add-a-new-distance-metric) that always throws.

4. Update `src/components/dashboard/hooks/automatic-grouping/index.ts` so that `getAutomaticGroups` calls your algorithm.
5. (Optionally) Update `useAutomaticGrouping` to expose your algorithm.

##### Example of algorithm

```typescript
interface AnalysisGroupWithReference extends AnalysisGroup {
  reference: CurrentAnalysis;
}

// Partitions the analyses into a set of reference solutions
// and a set of non-reference solutions.
const partitionAnalyses = (
  analyses: CurrentAnalysis[]
): {
  referenceSolutions: CurrentAnalysis[];
  nonReferenceSolutions: CurrentAnalysis[];
} => {
  const referenceSolutions: CurrentAnalysis[] = [];
  const nonReferenceSolutions: CurrentAnalysis[] = [];

  for (const analysis of analyses) {
    if (analysis.isReferenceSolution) {
      referenceSolutions.push(analysis);
    } else {
      nonReferenceSolutions.push(analysis);
    }
  }

  return {
    referenceSolutions,
    nonReferenceSolutions,
  };
};

// Our algorithm
export const referenceSolutionClustering = async (
  analyses: CurrentAnalysis[],
  distanceType: DistanceType
): Promise<AnalysisGroup[]> => {
  // Compute the distances between all pairs of solutions.
  const { referenceSolutions, nonReferenceSolutions } =
    partitionAnalyses(analyses);

  if (referenceSolutions.length === 0) {
    // If there are no reference solutions, return a single group containing all solutions.
    return [{ analyses }];
  }

  // Create a group for each reference solution.
  const referenceGroups = referenceSolutions.map<AnalysisGroupWithReference>(
    (analysis) => ({
      reference: analysis,
      analyses: [analysis],
    })
  );

  // For each non-reference solution, find the closest group and add it to that group.
  const referenceAssignments = await Promise.all(
    nonReferenceSolutions.map(async (analysis) => {
      // Compute the distances to all groups.
      const referenceDistances = await Promise.all(
        referenceGroups.map((group, groupIdx) =>
          getAstDistance(
            distanceType,
            analysis.generalAst,
            group.reference.generalAst
          ).then((distance) => ({
            distance,
            referenceGroupIndex: groupIdx,
          }))
        )
      );

      // Find the group with the minimum distance.
      const bestReference = referenceDistances.reduce(
        (best, reference) =>
          best.distance < reference.distance ? best : reference,
        {
          distance: Number.POSITIVE_INFINITY,
          referenceGroupIndex: 0,
        }
      );

      return {
        analysis,
        referenceGroupIndex: bestReference.referenceGroupIndex,
      };
    })
  );

  for (const referenceAssignment of referenceAssignments) {
    referenceGroups[referenceAssignment.referenceGroupIndex].analyses.push(
      referenceAssignment.analysis
    );
  }

  return referenceGroups;
};
```

#### Adding a new distance metric

To add a new distance metric for automatic grouping, you must:

1. Add a new value to `DistanceType` enum defined in `src/components/dashboard/hooks/ast-distance/distance-type.ts`.
2. Create a new file in `src/components/dashboard/hooks/ast-distance/`
3. Implement a function with the signature

  ```typescript
  (a: AstNode, b: AstNode): Promise<number>
  ```

4. Update `src/components/dashboard/hooks/ast-distance/index.ts` so that `getAstDistance` calls your new metric.
5. (Optionally) Update `useAutomaticGrouping` hook to expose your metric.

##### Example for distance metric (Zhang-Shasha)

```typescript
// Input parameters for the external library.
const insertCost = (_: AstNode): number => 1;
const removeCost = insertCost;
const updateCost = (a: AstNode, b: AstNode): number =>
  getAstNodeLabel(a) !== getAstNodeLabel(b) ? 1 : 0;

// The actual distance metric function.
export const computeZhangShashaDistance = (
  a: AstNode,
  b: AstNode
): Promise<number> => {
  const analysis = treeEditDistance(
    a,
    b,
    getAstNodeChildren,
    insertCost,
    removeCost,
    updateCost
  );
  return Promise.resolve(analysis.distance);
};
```

Here, `getAstNodeChildren` is a function that given an `AstNode`, returns the list of `AstNode` children.

Similarly, `getAstNodeLabel` returns a unique `string` label for any provided `AstNode`.

Note that the implementation of `getAstNodeChildren` and `getAstNodeLabel` is fully independent of the distance metric algorithm and may be used by many.

For example, see the similarity of the implementation of the [PQ-Grams distance](#example-distance-metric-pq-grams).

In both examples, we use external libraries that provide the `treeEditDistance` or `jqgram` functions.

##### Example for distance metric (PQ-Grams)

```typescript
// Transforms the input into the format that the external
// library expects.
const getInputForNode = (
  a: AstNode
): {
  root: AstNode;
  lfn: (node: AstNode) => string;
  cfn: (node: AstNode) => AstNode[];
} => ({
  root: a,
  lfn: getAstNodeLabel,
  cfn: getAstNodeChildren,
});

// The actual distance metric function.
export const computePqGramsDistance = (
  a: AstNode,
  b: AstNode,
  p = 2,
  q = 3
): Promise<number> =>
  new Promise((resolve) =>
    jqgram.distance(
      getInputForNode(a),
      getInputForNode(b),
      { p, q },
      (result) => resolve(result.distance)
    )
  );
```

## Testing

Tests for a criteria based analyzer must be written in a dedicated `.spec.ts` file in `frontend/src/data-analyzer/criteria-based-analyzers/__tests__/jest`. Use `condition.spec.ts` as a reference.

Tests for a solution grouping depend on your specific implementation. Please review the files in `frontend/src/components/dashboard/hooks/` and, when possible, follow a similar testing approach.

## Documentation

You are encouraged to document your implementation process and changes in one or more Markdown files, covering all the steps described above.
