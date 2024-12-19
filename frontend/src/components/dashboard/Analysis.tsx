import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { Chart } from "primereact/chart";
import {
  ChartConfiguration,
  ChartData,
  TooltipModel,
  Chart as ChartJsChart,
  BubbleDataPoint,
  Plugin,
  ChartEvent,
} from "chart.js";
import { _DeepPartialObject } from "chart.js/dist/types/utils";
import {
  AnnotationOptions,
  AnnotationPluginOptions,
  EventContext,
} from "chartjs-plugin-annotation";
import { TaskType } from "@/api/collimator/generated/models";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { Colors } from "@/constants/colors";
import { getStudentNickname } from "@/utilities/student-name";
import { AxesCriterionType, axisCriteria, getAxisConfig } from "./axes";
import XAxisSelector from "./axes/XAxisSelector";
import YAxis from "./axes/YAxis";
import XAxis from "./axes/XAxis";
import YAxisSelector from "./axes/YAxisSelector";
import { getCanvasPattern, getCategoryName } from "./category";
import SelectPlugin, { ChartSplit, SplitType } from "./chartjs-plugins/select";
import Select from "../form/Select";
import { cannotDeleteSplits, isAlreadyHandled, markAsHandled } from "./hacks";
import { CategorizedDataPoints, ManualGroup } from "./hooks/types";
import Tooltip from "./Tooltip";
import { createStar } from "./shapes/star";

type AdditionalChartData = {
  groupKey: string;
  groupName: string;
  solutions?: CurrentAnalysis[];
  isSelected: boolean;
  isBookmarked: boolean;
};

type PointWithAdditionalData = BubbleDataPoint & {
  additionalData: AdditionalChartData;
};

const messages = defineMessages({
  groupName: {
    id: "Analysis.groupName",
    defaultMessage: "Group",
  },
  numberOfStudents: {
    id: "Analysis.numberOfStudents",
    defaultMessage: "Number of Students",
  },
  xAxis: {
    id: "Analysis.xAxis",
    defaultMessage: "x-Axis",
  },
  yAxis: {
    id: "Analysis.yAxis",
    defaultMessage: "y-Axis",
  },
  selected: {
    id: "Analysis.selected",
    defaultMessage: "Selected",
  },
});

const AnalysisWrapper = styled.div``;

const ChartWrapper = styled.div`
  position: relative;

  /* make space for axes */
  padding-left: 1rem;
  padding-bottom: 1rem;
`;

const StudentName = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

const bubbleChartRadius = 10;
const selectedDataPointBorderWidth = 5;

const onEnterLabel = (context: EventContext) => {
  (context.element.options as AnnotationOptions<"label">).color =
    Colors.chartLabel.deleteSplitLabelColorHover;

  // rerender chart
  return true;
};

const onLeaveLabel = (context: EventContext) => {
  (context.element.options as AnnotationOptions<"label">).color =
    Colors.chartLabel.deleteSplitLabelColor;

  // rerender chart
  return true;
};

const customShapeSizeFactor = 3;
const customShapeStrokeFactor = 2;

const Analysis = ({
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
  taskType,
  manualGroups: groups,
  categorizedDataPoints,
  splittingEnabled,
  splits,
  setSplits,
  selectedSolutionIds,
  onSelectSolution,
  bookmarkedSolutionIds,
}: {
  xAxis: AxesCriterionType;
  setXAxis: (axis: AxesCriterionType) => void;
  yAxis: AxesCriterionType;
  setYAxis: (axis: AxesCriterionType) => void;
  taskType: TaskType;
  manualGroups: ManualGroup[];
  categorizedDataPoints: CategorizedDataPoints[];
  splittingEnabled: boolean;
  splits: ChartSplit[];
  setSplits: (
    updateSplits: (currentSplits: ChartSplit[]) => ChartSplit[],
  ) => void;
  selectedSolutionIds: number[];
  onSelectSolution: (groupId: string, solution: CurrentAnalysis) => void;
  bookmarkedSolutionIds: number[];
}) => {
  const intl = useIntl();

  const [tooltipDataPoints, setTooltipDataPoints] = useState<
    PointWithAdditionalData[]
  >([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipHovered = useRef(false);

  const xAxisConfig = useMemo(() => getAxisConfig(xAxis), [xAxis]);
  const yAxisConfig = useMemo(() => getAxisConfig(yAxis), [yAxis]);

  const chartRef = useRef<ChartJsChart | null>(null);
  const initialChartDataRef = useRef<{
    data: ChartData<"bubble">;
    options: ChartConfiguration<"bubble">["options"];
  } | null>(null);

  const chartData = useMemo<ChartData<"bubble">>(
    () => ({
      datasets: categorizedDataPoints.map((category) => {
        const data = category.dataPoints
          .map((dataPoint) => {
            const isSelected = dataPoint.solutions?.some((s) =>
              selectedSolutionIds.includes(s.id),
            );

            const isBookmarked = dataPoint.solutions?.some((s) =>
              bookmarkedSolutionIds.includes(s.id),
            );

            return {
              x: dataPoint.x,
              y: dataPoint.y,
              r: isSelected
                ? // add half of the border width to the radius if the data point is selected
                  // to ensure the border is fully visible
                  bubbleChartRadius + selectedDataPointBorderWidth / 2
                : bubbleChartRadius,
              additionalData: {
                groupKey: dataPoint.groupKey,
                groupName: dataPoint.groupName,
                solutions: dataPoint.solutions,
                isSelected,
                isBookmarked,
              } as AdditionalChartData,
            };
          })
          // the legend always uses the first item - ensure
          // the first item is a non-selected data point if there is one
          // see https://github.com/chartjs/Chart.js/pull/5621
          .toSorted(
            (a, b) =>
              +a.additionalData.isSelected - +b.additionalData.isSelected,
          );

        const pattern = getCanvasPattern(category.category);

        return {
          label: getCategoryName(intl, category.category),
          data,

          backgroundColor: pattern,
          pointStyle: data.map((point) =>
            point.additionalData.isBookmarked
              ? createStar(
                  customShapeSizeFactor *
                    (bubbleChartRadius + selectedDataPointBorderWidth),
                  pattern,
                  point.additionalData.isSelected
                    ? customShapeStrokeFactor * selectedDataPointBorderWidth
                    : 0,
                  Colors.dataPoint.selectedBorderColor,
                )
              : "circle",
          ),
          borderColor: data.map((point) =>
            point.additionalData.isSelected
              ? Colors.dataPoint.selectedBorderColor
              : "black",
          ),
          hoverBorderWidth: data.map((point) =>
            point.additionalData.isSelected ? selectedDataPointBorderWidth : 0,
          ),
          borderWidth: data.map((point) =>
            point.additionalData.isSelected ? selectedDataPointBorderWidth : 0,
          ),
        };
      }),
    }),
    [categorizedDataPoints, selectedSolutionIds, bookmarkedSolutionIds, intl],
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

      if (tooltipHovered.current) {
        // do *not* change the tooltip while the user is hovering over it
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

  const annotations = useMemo<_DeepPartialObject<AnnotationPluginOptions>>(
    () => ({
      // allow annotations in axes
      clip: false,

      annotations: [
        ...(splittingEnabled ? splits : []).flatMap<AnnotationOptions>(
          (split) => {
            const onClickLabel = (ctx: EventContext, evt: ChartEvent) => {
              if (
                !evt.native ||
                isAlreadyHandled(evt.native) ||
                cannotDeleteSplits(ctx)
              ) {
                return;
              }
              markAsHandled(evt.native);

              setSplits((splits) => splits.filter((s) => s !== split));
            };

            const labelProps = {
              type: "label" as const,
              content: "x",
              color: Colors.chartLabel.deleteSplitLabelColor,
              backgroundColor: Colors.chartLabel.deletSplitLabelBackgroundColor,
              padding: {
                x: 13,
                y: 2,
              },
              font: {
                size: 25,
              },
              click: onClickLabel,
              enter: onEnterLabel,
              leave: onLeaveLabel,
            };

            return split.type === SplitType.horizontal
              ? [
                  {
                    type: "line",
                    xMin: (ctx) => ctx.chart.scales.x.min,
                    xMax: (ctx) => ctx.chart.scales.x.max,
                    yMin: split.y,
                    yMax: split.y,
                  },
                  {
                    ...labelProps,
                    xValue: (ctx) => ctx.chart.scales.x.min,
                    yValue: split.y,
                    position: {
                      x: "end" as const,
                      y: "center" as const,
                    },
                  },
                ]
              : [
                  {
                    type: "line",
                    xMin: split.x,
                    xMax: split.x,
                    yMin: (ctx) => ctx.chart.scales.y.min,
                    yMax: (ctx) => ctx.chart.scales.y.max,
                  },
                  {
                    ...labelProps,
                    xValue: split.x,
                    yValue: (ctx) => ctx.chart.scales.y.min,
                    position: {
                      x: "center" as const,
                      y: "start" as const,
                    },
                  },
                ];
          },
        ),
        ...groups.flatMap<AnnotationOptions>((group) => [
          {
            type: "label" as const,
            content: group.groupLabel,
            color: Colors.chartLabel.groupLabelColor,
            xValue: (ctx) => {
              const min = Math.max(group.minX, ctx.chart.scales.x.min);
              const max = Math.min(group.maxX, ctx.chart.scales.x.max);

              return (max + min) / 2;
            },
            yValue: (ctx) => {
              const min = Math.max(group.minY, ctx.chart.scales.y.min);
              const max = Math.min(group.maxY, ctx.chart.scales.y.max);

              return (max + min) / 2;
            },
            padding: 0,
            font: {
              size: 25,
            },
          },
        ]),
      ],
    }),
    [splittingEnabled, splits, setSplits, groups],
  );

  const chartOptions = useMemo<ChartConfiguration<"bubble">["options"]>(
    () => ({
      plugins: {
        legend: {
          display: true,
          position: "right",
          align: "center",
        },

        select: {
          enabled: splittingEnabled,
          onAddSplit: (split) => {
            setSplits((splits) => [...splits, split]);
          },
        },

        tooltip: {
          enabled: false,
          position: "nearest",
          external: onTooltip,
        },

        annotation: annotations,
      },
      scales: {
        x: xAxisConfig,
        y: yAxisConfig,
      },
      /* disable animations - looks weird when re-rendering the chart */
      animation: false,
    }),
    [
      splittingEnabled,
      xAxisConfig,
      yAxisConfig,
      onTooltip,
      annotations,
      setSplits,
    ],
  );

  useEffect(() => {
    const chart = chartRef.current;
    if (chart?.canvas) {
      chart.config.data = chartData;
      chart.config.options = chartOptions;
      chart.update();

      // clear the initial data, now that we have a chart reference
      initialChartDataRef.current = null;
    } else {
      // chart was not yet initialized - store the data for later
      initialChartDataRef.current = {
        data: chartData,
        options: chartOptions,
      };
    }
  }, [chartData, chartOptions]);

  const axisOptions = useMemo(
    () =>
      axisCriteria.map((c) => ({
        value: c.criterion,
        label: c.messages(taskType).name,
      })),
    [taskType],
  );

  const plugins = useMemo(
    () => [
      SelectPlugin,
      {
        id: "analysis",
        afterInit: (chart) => {
          chartRef.current = chart;
          chart.config.data = initialChartDataRef.current?.data ?? chartData;
          chart.config.options =
            initialChartDataRef.current?.options ?? chartOptions;

          chart.update();
        },
      } as Plugin,
    ],
    // this should never be re-run - we only want to set the initial data and after
    // that updates are handled by the useEffect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onMouseEnterTooltip = useCallback(() => {
    tooltipHovered.current = true;
  }, []);

  const onMouseLeaveTooltip = useCallback(() => {
    tooltipHovered.current = false;
    setTooltipDataPoints([]);
  }, []);

  // group the tooltip data points by group name
  // s.t. we can display one tooltip per group
  const tooltipsByGroupName = useMemo(
    () =>
      Object.entries(
        tooltipDataPoints.reduce(
          (acc, dataPoint) => {
            if (dataPoint.additionalData.groupName in acc) {
              acc[dataPoint.additionalData.groupName].push(dataPoint);
            } else {
              acc[dataPoint.additionalData.groupName] = [dataPoint];
            }

            return acc;
          },
          {} as Record<string, PointWithAdditionalData[]>,
        ),
      ),
    [tooltipDataPoints],
  );

  return (
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
        <Chart type="bubble" plugins={plugins} />
        <XAxis />
        <YAxis />
        <Tooltip
          ref={tooltipRef}
          isShown={tooltipDataPoints.length > 0}
          onMouseEnter={onMouseEnterTooltip}
          onMouseLeave={onMouseLeaveTooltip}
        >
          {tooltipsByGroupName.map(([name, points]) => (
            <div key={name}>
              <div className="data">
                <div>
                  <span>
                    <strong>{intl.formatMessage(messages.groupName)}</strong>
                  </span>
                  <span>
                    <strong>{name}</strong>
                  </span>
                </div>
                <div>
                  <span>{intl.formatMessage(messages.numberOfStudents)}</span>
                  <span>
                    {points
                      .map((p) => p.additionalData.solutions?.length ?? 0)
                      .reduce((sum, a) => sum + a, 0)}
                  </span>
                </div>
                <div>
                  <ul>
                    {points.map((dataPoint) => {
                      const solutions = dataPoint.additionalData.solutions;
                      return solutions === undefined || solutions.length === 0
                        ? null
                        : solutions.map((solution) => (
                            <li key={solution.id}>
                              <StudentName
                                onClick={() =>
                                  onSelectSolution(
                                    dataPoint.additionalData.groupKey,
                                    solution,
                                  )
                                }
                              >
                                {getStudentNickname(solution.studentPseudonym)}
                              </StudentName>
                            </li>
                          ));
                    })}
                  </ul>
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
  );
};

export default Analysis;
