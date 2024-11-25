import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import MultiSwrContent from "../MultiSwrContent";
import { AstFilter, filterToAnalysisInput, matchesFilter } from "./filter";
import { AstGroup, getGroup, groupToAnalysisInput } from "./group";
import { useCallback, useMemo, useRef, useState } from "react";
import { analyzeAst, CriterionType } from "@/data-analyzer/analyze-asts";
import {
  AxesCriterionType,
  axisCriteria,
  getAxisAnalysisInput,
  getAxisAnalysisValue,
  getAxisConfig,
} from "./axes";
import { Chart } from "primereact/chart";
import {
  ChartConfiguration,
  ChartData,
  TooltipModel,
  Chart as ChartJsChart,
  BubbleDataPoint,
} from "chart.js";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import Select from "../form/Select";
import { TaskType } from "@/api/collimator/generated/models";
import XAxisSelector from "./axes/XAxisSelector";
import YAxis from "./axes/YAxis";
import XAxis from "./axes/XAxis";
import YAxisSelector from "./axes/YAxisSelector";
import Tooltip from "./Tooltip";
import { getCanvasPattern, getSuperGroupName, SuperGroup } from "./super-group";
import { mean } from "./statistics";

type AnalyzedSolution = {
  solutionId: number;
  xAxisValue: number;
  yAxisValue: number;
  superGroup: SuperGroup;
  group: string;
};

type AnalyzedGroup = {
  meanX: number;
  meanY: number;
  solutionIds: number[];
  superGroup: SuperGroup;
};

type AnalyzedSuperGroup = {
  superGroup: SuperGroup;
  groups: AnalyzedGroup[];
};

type AdditionalChartData = {
  groupName: string;
  solutionIds: number[];
};

const messages = defineMessages({
  xAxis: {
    id: "Analysis.xAxis",
    defaultMessage: "x-Axis",
  },
  yAxis: {
    id: "Analysis.yAxis",
    defaultMessage: "y-Axis",
  },
});

const AnalysisWrapper = styled.div`
  /* make space tooltips */
  padding-bottom: 5rem;
`;

const ChartWrapper = styled.div`
  position: relative;

  /* make space for axes */
  padding-left: 1rem;
  padding-bottom: 1rem;
`;

const Analysis = ({
  session,
  taskId,
  taskType,
  filters,
  groups,
}: {
  session: ExistingSessionExtended;
  taskId: number;
  taskType: TaskType;
  filters: AstFilter[];
  groups: AstGroup[];
}) => {
  const intl = useIntl();

  const [tooltipDataPoints, setTooltipDataPoints] = useState<
    (BubbleDataPoint & {
      additionalData: AdditionalChartData;
    })[]
  >([]);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [xAxis, setXAxis] = useState<AxesCriterionType>(
    CriterionType.statement,
  );
  const [yAxis, setYAxis] = useState<AxesCriterionType>(CriterionType.loop);

  const xAxisConfig = useMemo(() => getAxisConfig(xAxis), [xAxis]);
  const yAxisConfig = useMemo(() => getAxisConfig(yAxis), [yAxis]);

  const {
    data: solutions,
    isLoading: isLoadingSolutions,
    error: solutionsError,
  } = useCurrentSessionTaskSolutions(session.klass.id, session.id, taskId);

  const superGroups = useMemo(() => {
    if (!solutions) {
      return [];
    }

    const solutionsByGroup = solutions
      .map<AnalyzedSolution>((solution) => {
        const xAxisValue = getAxisAnalysisValue(
          xAxis,
          analyzeAst(solution.generalAst, getAxisAnalysisInput(xAxis)),
        );

        const yAxisValue = getAxisAnalysisValue(
          yAxis,
          analyzeAst(solution.generalAst, getAxisAnalysisInput(yAxis)),
        );

        const matchesAllFilters = filters
          .map((f) =>
            matchesFilter(
              f,
              analyzeAst(solution.generalAst, filterToAnalysisInput(f)),
            ),
          )
          .reduce(
            (matchesAllFilters, matchesFilter) =>
              matchesAllFilters && matchesFilter,
            true,
          );

        // the differen groups are again grouped into super groups
        // based on global criteria such as whether all filters match
        // or whether a solution passes all tests
        let superGroup = SuperGroup.none;

        if (matchesAllFilters) {
          superGroup |= SuperGroup.matches;
        }

        const assignedGroups =
          groups.length > 0
            ? groups.map((g) =>
                getGroup(
                  g,
                  analyzeAst(solution.generalAst, groupToAnalysisInput(g)),
                ),
              )
            : // if no groups are defined, all solutions are in a different group
              solution.id.toString();

        const group = [
          // always include the super groups because those group the groups
          // and hence if solutions are not in the same super group they cannot be in the same group
          superGroup.toString(),
          ...assignedGroups,
        ].join("-");

        return {
          solutionId: solution.solutionId,
          xAxisValue,
          yAxisValue,
          superGroup,
          group,
        };
      })
      .reduce(
        (groups, analyzedSolution) => {
          if (!groups[analyzedSolution.group]) {
            groups[analyzedSolution.group] = [];
          }

          groups[analyzedSolution.group].push(analyzedSolution);

          return groups;
        },
        {} as { [key: string]: AnalyzedSolution[] },
      );

    const groupsBySuperGroup = Object.values(solutionsByGroup)
      .map<AnalyzedGroup>((solutions) => {
        const meanX = mean(solutions.map((s) => s.xAxisValue));
        const meanY = mean(solutions.map((s) => s.yAxisValue));
        const superGroup = solutions[0].superGroup;

        if (solutions.some((s) => s.superGroup !== superGroup)) {
          throw new Error(
            "Solutions in the same group must have the same super group",
          );
        }

        return {
          meanX,
          meanY,
          solutionIds: solutions.map((s) => s.solutionId),
          superGroup,
        };
      })
      .reduce(
        (superGroups, analyzedGroup) => {
          if (!superGroups[analyzedGroup.superGroup]) {
            superGroups[analyzedGroup.superGroup] = {
              superGroup: analyzedGroup.superGroup,
              groups: [],
            };
          }

          superGroups[analyzedGroup.superGroup].groups.push(analyzedGroup);

          return superGroups;
        },
        {} as { [key: number]: AnalyzedSuperGroup },
      );

    return Object.values(groupsBySuperGroup);
  }, [solutions, xAxis, yAxis, filters, groups]);

  const chartData = useMemo<ChartData<"bubble">>(
    () => ({
      datasets: superGroups.map((superGroup, superGroupIndex) => ({
        label: getSuperGroupName(intl, superGroup.superGroup),
        data: superGroup.groups.map((group, groupIndex) => ({
          x: group.meanX,
          y: group.meanY,
          r: group.solutionIds.length * 10,
          additionalData: {
            groupName: `Group ${superGroupIndex}.${groupIndex}`,
            solutionIds: group.solutionIds,
          } as AdditionalChartData,
        })),

        backgroundColor: getCanvasPattern(superGroup.superGroup),
      })),
    }),
    [superGroups, intl],
  );

  const onTooltip = useCallback(
    ({
      chart,
      tooltip,
    }: {
      chart: ChartJsChart;
      tooltip: TooltipModel<"bubble">;
    }) => {
      const tooltipElement = tooltipRef.current;

      if (!tooltipElement) {
        return;
      }

      if (tooltip.opacity === 0) {
        // Hide the tooltip
        setTooltipDataPoints([]);
        return;
      }

      const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

      // update position of tooltip
      tooltipElement.style.left = positionX + tooltip.caretX + "px";
      tooltipElement.style.top = positionY + tooltip.caretY + "px";

      setTooltipDataPoints(
        tooltip.dataPoints.map(
          (dataPoint) =>
            chart.data.datasets[dataPoint.datasetIndex].data[
              dataPoint.dataIndex
            ] as BubbleDataPoint & {
              additionalData: AdditionalChartData;
            },
        ),
      );
    },
    [],
  );

  const chartOptions = useMemo<ChartConfiguration<"bubble">["options"]>(
    () => ({
      plugins: {
        legend: {
          display: true,
          position: "right",
          align: "center",
        },

        tooltip: {
          enabled: false,
          position: "nearest",
          external: onTooltip,
        },
      },
      scales: {
        x: xAxisConfig,
        y: yAxisConfig,
      },
      /* seems buggy, maybe in combination with react? */
      animation: false,
    }),
    [xAxisConfig, yAxisConfig, onTooltip],
  );

  const axisOptions = useMemo(
    () =>
      axisCriteria.map((c) => ({
        value: c.criterion,
        label: c.messages(taskType).name,
      })),
    [taskType],
  );

  const selectedXAxis = axisOptions.find((o) => o.value === xAxis);
  const selectedYAxis = axisOptions.find((o) => o.value === yAxis);

  return (
    <MultiSwrContent
      data={[solutions]}
      isLoading={[isLoadingSolutions]}
      errors={[solutionsError]}
    >
      {([_data]) => (
        <AnalysisWrapper>
          <YAxisSelector>
            <Select
              options={axisOptions}
              onChange={(e) => {
                setYAxis(e.target.value as AxesCriterionType);
              }}
              value={yAxis}
              alwaysShow
              noMargin
            />
          </YAxisSelector>
          <ChartWrapper>
            <Chart type="bubble" data={chartData} options={chartOptions} />
            <XAxis />
            <YAxis />
            <Tooltip ref={tooltipRef} isShown={tooltipDataPoints.length > 0}>
              {tooltipDataPoints.map((data) => (
                <div key={data.additionalData.groupName}>
                  <h5>{data.additionalData.groupName}</h5>

                  <p>
                    <FormattedMessage
                      id="Analysis.groupContainsXSolutions"
                      defaultMessage="This group contains {solutionCount} solutions."
                      values={{
                        solutionCount: data.additionalData.solutionIds.length,
                      }}
                    />
                  </p>

                  <div>
                    <div>
                      {intl.formatMessage(
                        selectedXAxis?.label ?? messages.xAxis,
                      )}
                      : {data.x}
                    </div>
                    <div>
                      {intl.formatMessage(
                        selectedYAxis?.label ?? messages.yAxis,
                      )}
                      : {data.y}
                    </div>
                  </div>
                </div>
              ))}
            </Tooltip>
          </ChartWrapper>
          <XAxisSelector>
            <Select
              options={axisOptions}
              onChange={(e) => {
                setXAxis(e.target.value as AxesCriterionType);
              }}
              value={xAxis}
              alwaysShow
              noMargin
            />
          </XAxisSelector>
        </AnalysisWrapper>
      )}
    </MultiSwrContent>
  );
};

export default Analysis;
