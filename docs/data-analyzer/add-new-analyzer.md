# How to add new Analysis Logic

To provide a scalable system with minimal resource requirements on the server, the analysis is performed client-side, i.e. in `frontend/`.

This document will guide you through the process of adding additional types of analyses.

## Criteria Based Analyzer

Criteria based analyzers are located in `frontend/src/data-analyzer/criteria-based-analyzers`.

As an example, a simple analyzer to count the number of conditions in the [G-AST](ast.md) may look like the following:

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

where `walkAst` is an utility function recursively walking the AST and calling `statementCallback` for every statement that is found.

The enum `AstCriterionType` as well as the types `CriteriaBasedAnalyzerInput` and `CriteriaBasedAnalyzerOutput` are defined in `frontend/src/data-analyzer/analyze-asts.ts` which additionally defines the global `analyzeAst` function.
This function, given an G-AST and a criterion input, runs the respective analyzer and its output.

In `frontend/src/components/dashboard/criteria` the `analyzeAst` is then used for 1) axes and 2) filters.

To add a new AST criterion, you will need to

1. Add your criterion to the `AstCriterionType` enum and the types `CriteriaBasedAnalyzerInput`, `CriteriaBasedAnalyzerOutput`, `AnalysisFunction` in `frontend/src/data-analyzer/analyze-asts.ts`.
2. Create a new analyzer in `frontend/src/data-analyzer/criteria-based-analyzers` and extend the `analyzeAst` function in `frontend/src/data-analyzer/analyze-asts.ts`.
3. Use the analyzer in an axis or a filter as described below.

To add a new meta criterion (if its unrelated to the AST), you will need to

1. Add your criterion to `MetaCriterionType` in `frontend/src/data-analyzer/meta-criterion-type.ts`.
2. Define an axis or a filter as described below.

### Axis

To use a given criterion as an axis in the analyzer, an instance of `CriterionAxisDefinition<>` must be defined in `frontend/src/components/dashboard/criteria`.
For the criterion example counting the number of condition statements, this may look like the following:

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

    // A function that, given an analysis, returns the respective axis value
    getAxisValue: (analysis) => {
      const numberOfConditions = analyzeAst(analysis.generalAst, {
        criterion,
        input: undefined,
      }).output;

      return numberOfConditions;
    },
  };
```

Note that for axes, it is currently not possible to provide additional input parameters.

To add a new axis, you will need to

1. Define a new instance of `CriterionAxisDefinition` in `frontend/src/components/dashboard/criteria`.
2. Add it to the `axisCriteria` list in `frontend/src/components/dashboard/axes/index.ts`.

### Filter

To use a given criterion as an axis in the analyzer, an instance of `CriterionFilterDefinition<>` must be defined in `frontend/src/components/dashboard/criteria`.
For the criterion example counting the number of condition statements, this may look like the following:

```typescript
export const ConditionCriterionFilter: CriterionFilterDefinition<
  AstCriterionType.condition,
  ConditionFilterCriterion,
  ConditionFilterCriterionParameters
> = {
  // Which cirterion is this filter for
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
  run: (config, analyes) => {
    const numberOfConditionsList = analyes.map(
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

The corresponding filter component may look like this:

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

To add a new axis, you will need to

1. Define a new instance of `CriterionFilterDefinition`, including a `CriterionFormComponent` in `frontend/src/components/dashboard/criteria`.
2. Add it to the `filterCriteria` list in `frontend/src/components/dashboard/filter/index.ts`.
3. Extend the component `CriterionFilterForm` in `frontend/src/components/dashboard/filter/CriterionFilterForm.tsx` to support your new filter form.
