import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { Category, getCanvasPattern, getCategoryName } from "./category";
import SelectPlugin, { SplitType } from "./chartjs-plugins/select";
import Select from "../form/Select";
import { cannotDeleteSplits, isAlreadyHandled, markAsHandled } from "./hacks";
import { CategorizedDataPoint, ManualGroup } from "./hooks/types";
import Tooltip from "./Tooltip";
import { createStar } from "./shapes/star";
import {
  AnalyzerState,
  AnalyzerStateAction,
  AnalyzerStateActionType,
} from "./Analyzer.state";

type AdditionalChartData = {
  groups: {
    key: string;
    name: string;
    analyses: CurrentAnalysis[];
  }[];
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
  taskType,
  state,
  dispatch,
  manualGroups,
  categorizedDataPoints,
  onSelectSolution,
}: {
  taskType: TaskType;
  state: AnalyzerState;
  dispatch: Dispatch<AnalyzerStateAction>;
  manualGroups: ManualGroup[];
  categorizedDataPoints: CategorizedDataPoint[];
  onSelectSolution: (groupId: string, solution: CurrentAnalysis) => void;
}) => {
  const intl = useIntl();

  const [tooltipDataPoints, setTooltipDataPoints] = useState<
    PointWithAdditionalData[]
  >([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipHovered = useRef(false);

  const setXAxis = useCallback(
    (newAxis: AxesCriterionType) =>
      dispatch({ type: AnalyzerStateActionType.setXAxis, axis: newAxis }),
    [dispatch],
  );

  const setYAxis = useCallback(
    (newAxis: AxesCriterionType) =>
      dispatch({ type: AnalyzerStateActionType.setYAxis, axis: newAxis }),
    [dispatch],
  );

  const splittingEnabled = !state.isAutomaticGrouping;
  const xAxisConfig = useMemo(() => getAxisConfig(state.xAxis), [state.xAxis]);
  const yAxisConfig = useMemo(() => getAxisConfig(state.yAxis), [state.yAxis]);
  const selectedSolutionIds = useMemo(
    () => [state.selectedLeftSolution, state.selectedRightSolution],
    [state.selectedLeftSolution, state.selectedRightSolution],
  );

  const chartRef = useRef<ChartJsChart | null>(null);
  const initialChartDataRef = useRef<{
    data: ChartData<"bubble">;
    options: ChartConfiguration<"bubble">["options"];
  } | null>(null);

  const chartData = useMemo<ChartData<"bubble">>(() => {
    const categories = new Set(categorizedDataPoints.map((d) => d.category));

    // aggregate data points within a category by x and y coordinates
    const byCoordinates = categorizedDataPoints.reduce((acc, dataPoint) => {
      const byX = acc.get(dataPoint.x);
      if (byX) {
        const byY = byX.get(dataPoint.y);

        if (byY) {
          byY.push(dataPoint);
        } else {
          byX.set(dataPoint.y, [dataPoint]);
        }
      } else {
        acc.set(dataPoint.x, new Map([[dataPoint.y, [dataPoint]]]));
      }

      return acc;
    }, new Map<number, Map<number, CategorizedDataPoint[]>>());

    let hasMixed = false;

    const mergedDataPoints = byCoordinates
      .entries()
      .flatMap(([x, byY]) =>
        byY.entries().map(([y, dataPoints]) => ({
          x,
          y,
          dataPoints,
        })),
      )
      .toArray();

    // map each (x, y) coordinate to a chart.js dataset
    // since points of different categories may overlap
    const points = mergedDataPoints.flatMap(({ x, y, dataPoints }) => {
      if (dataPoints.length === 0) {
        return [];
      }

      const firstCategory = dataPoints[0].category;
      const multipleCategories = dataPoints.some(
        (dataPoint) => dataPoint.category !== firstCategory,
      );

      const category = multipleCategories ? Category.mixed : firstCategory;
      hasMixed = hasMixed || multipleCategories;

      // check if any of the data points is selected or bookmarked
      const isSelected = dataPoints.some((dataPoint) =>
        dataPoint.analyses?.some((s) =>
          selectedSolutionIds.includes(s.solutionId),
        ),
      );

      const isBookmarked = dataPoints.some((dataPoint) =>
        dataPoint.analyses?.some((s) =>
          state.bookmarkedSolutionIds.includes(s.solutionId),
        ),
      );

      const solutionsCount = dataPoints.reduce(
        (acc, dataPoint) => acc + (dataPoint.analyses?.length || 0),
        0,
      );

      const size = Math.min(solutionsCount * 8, 40);
      const pattern = getCanvasPattern(category);

      return {
        // with a leading underscore, the label is hidden in the legend
        label: `_${getCategoryName(intl, category)}`,
        data: [
          {
            x,
            y,
            r:
              // increase the radius based on the number of solutions
              size +
              // add half of the border width to the radius if the data point is selected
              // to ensure the border is on top of the bubble size
              (isSelected ? selectedDataPointBorderWidth / 2 : 0),
            additionalData: {
              groups: Object.entries(
                dataPoints.reduce(
                  (byGroupKey, dataPoint) => {
                    if (dataPoint.groupKey in byGroupKey) {
                      byGroupKey[dataPoint.groupKey].push(dataPoint);
                    } else {
                      byGroupKey[dataPoint.groupKey] = [dataPoint];
                    }

                    return byGroupKey;
                  },
                  {} as { [groupKey: string]: CategorizedDataPoint[] },
                ),
              ).map(([key, groupDataPoints]) => ({
                key,
                name: groupDataPoints[0].groupName,
                analyses: groupDataPoints.flatMap((d) => d.analyses ?? []),
              })),
              isSelected,
              isBookmarked,
            } satisfies AdditionalChartData,
          },
        ],

        backgroundColor: pattern,
        pointStyle: isBookmarked
          ? createStar(
              customShapeSizeFactor * (size + selectedDataPointBorderWidth),
              pattern,
              isSelected
                ? customShapeStrokeFactor * selectedDataPointBorderWidth
                : 0,
              Colors.dataPoint.selectedBorderColor,
            )
          : "circle",
        borderColor: isSelected
          ? Colors.dataPoint.selectedBorderColor
          : "black",
        hoverBorderWidth: isSelected ? selectedDataPointBorderWidth : 0,
        borderWidth: isSelected ? selectedDataPointBorderWidth : 0,
      };
    });

    return {
      datasets: [
        ...points,
        // for each distinct category, add an empty dataset to the chart
        // which is used to display the category in the legend
        ...(hasMixed ? [...categories, Category.mixed] : categories)
          .values()
          .map(
            (category) =>
              ({
                label: getCategoryName(intl, category),
                data: [],
                backgroundColor: getCanvasPattern(category),
              }) satisfies ChartData<"bubble">["datasets"][0],
          ),
      ],
    } satisfies ChartData<"bubble">;
  }, [
    intl,
    categorizedDataPoints,
    selectedSolutionIds,
    state.bookmarkedSolutionIds,
  ]);

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
        ...(splittingEnabled ? state.splits : []).flatMap<AnnotationOptions>(
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

              dispatch({
                type: AnalyzerStateActionType.removeSplit,
                split,
              });
            };

            const labelProps = {
              type: "label" as const,
              content: "x",
              color: Colors.chartLabel.deleteSplitLabelColor,
              backgroundColor: Colors.chartLabel.deletSplitLabelBackgroundColor,
              padding: {
                x: 8,
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
        ...manualGroups.flatMap<AnnotationOptions>((group) => [
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
    [splittingEnabled, state.splits, dispatch, manualGroups],
  );

  const chartOptions = useMemo<ChartConfiguration<"bubble">["options"]>(
    () => ({
      plugins: {
        legend: {
          display: true,
          position: "right",
          align: "center",
          labels: {
            // hide labels starting with "_"
            filter: (legendItem) => !legendItem.text.startsWith("_"),
          },
          onClick(_e, legendItem, legend) {
            const legendIdx = legendItem.datasetIndex;

            if (legendIdx === undefined) {
              return;
            }

            const ci = legend.chart;
            const indexesToToggle = [
              // hide the legend
              legendIdx,
              // and all datasets starting with an underscore and then the same label
              // because we have a dataset per (x, y) coordinate to account for overlapping points
              ...ci.data.datasets
                .map((dataset, idx) => ({
                  label: dataset.label ?? "",
                  index: idx,
                }))
                .filter(({ label }) => label.startsWith(`_${legendItem.text}`))
                .map(({ index }) => index),
            ];

            if (indexesToToggle.length === 0) {
              return;
            }

            indexesToToggle.forEach((index) => {
              if (ci.isDatasetVisible(index)) {
                ci.hide(index);
              } else {
                ci.show(index);
              }
            });
          },
        },

        select: {
          enabled: splittingEnabled,
          onAddSplit: (split) =>
            dispatch({
              type: AnalyzerStateActionType.addSplit,
              split,
            }),
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
      dispatch,
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

  const selectedXAxis = axisOptions.find((o) => o.value === state.xAxis);
  const selectedYAxis = axisOptions.find((o) => o.value === state.yAxis);

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

  return (
    <AnalysisWrapper>
      <YAxisSelector>
        <Select
          options={axisOptions}
          onChange={(e) => {
            setYAxis(e.target.value as AxesCriterionType);
          }}
          value={state.yAxis}
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
          {tooltipDataPoints.map((dataPoint) => (
            <div key={`${dataPoint.x}-${dataPoint.y}`}>
              <div className="data">
                <div>
                  <span>
                    <strong>
                      {intl.formatMessage(
                        selectedXAxis?.label ?? messages.xAxis,
                      )}
                    </strong>
                  </span>
                  <span>
                    <strong>{dataPoint.x}</strong>
                  </span>
                </div>
                <div>
                  <span>
                    <strong>
                      {intl.formatMessage(
                        selectedYAxis?.label ?? messages.yAxis,
                      )}
                    </strong>
                  </span>
                  <span>
                    <strong>{dataPoint.y}</strong>
                  </span>
                </div>
              </div>
              {dataPoint.additionalData.groups.map((group) => (
                <div key={group.key} className="data group">
                  <div>
                    <span>
                      <strong>{intl.formatMessage(messages.groupName)}</strong>
                    </span>
                    <span>
                      <strong>{group.name}</strong>
                    </span>
                  </div>
                  <div>
                    <span>{intl.formatMessage(messages.numberOfStudents)}</span>
                    <span>{group.analyses.length}</span>
                  </div>
                  <div>
                    <ul>
                      {group.analyses.map((analysis) => (
                        <li key={analysis.id}>
                          <StudentName
                            onClick={() =>
                              onSelectSolution(group.key, analysis)
                            }
                          >
                            {getStudentNickname(analysis.studentPseudonym)} (
                            {analysis.solutionId})
                          </StudentName>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
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
          value={state.xAxis}
          alwaysShow
          noMargin
        />
      </XAxisSelector>
    </AnalysisWrapper>
  );
};

export default Analysis;
