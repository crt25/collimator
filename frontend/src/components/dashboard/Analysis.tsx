import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AxesCriterionType, axisCriteria, getAxisConfig } from "./axes";
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
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import Select from "../form/Select";
import { TaskType } from "@/api/collimator/generated/models";
import XAxisSelector from "./axes/XAxisSelector";
import YAxis from "./axes/YAxis";
import XAxis from "./axes/XAxis";
import YAxisSelector from "./axes/YAxisSelector";
import Tooltip from "./Tooltip";
import { getCanvasPattern, getCategoryName } from "./category";
import SelectPlugin, { ChartSplit, SplitType } from "./chartjs-plugins/select";
import {
  AnnotationOptions,
  AnnotationPluginOptions,
  EventContext,
} from "chartjs-plugin-annotation";
import { _DeepPartialObject } from "chart.js/dist/types/utils";
import { CategorizedDataPoints, ManualGroup } from "./hooks/types";

type AdditionalChartData = {
  groupName: string;
};

type PointWithAdditionalData = BubbleDataPoint & {
  additionalData: AdditionalChartData;
};

const messages = defineMessages({
  groupName: {
    id: "Analysis.groupName",
    defaultMessage: "Group",
  },
  xAxis: {
    id: "Analysis.xAxis",
    defaultMessage: "x-Axis",
  },
  yAxis: {
    id: "Analysis.yAxis",
    defaultMessage: "y-Axis",
  },
});

const AnalysisWrapper = styled.div``;

const ChartWrapper = styled.div`
  position: relative;

  /* make space for axes */
  padding-left: 1rem;
  padding-bottom: 1rem;
`;

const groupLabelColor = "rgba(0, 0, 0, 0.5)";
const deleteLabelColor = "rgba(255, 99, 132, 0.5)";
const deleteLabelColorHover = "rgba(255, 99, 132, 1)";

const onEnterLabel = (context: EventContext) => {
  (context.element.options as AnnotationOptions<"label">).color =
    deleteLabelColorHover;

  // rerender chart
  return true;
};

const onLeaveLabel = (context: EventContext) => {
  (context.element.options as AnnotationOptions<"label">).color =
    deleteLabelColor;

  // rerender chart
  return true;
};

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
}) => {
  const intl = useIntl();

  const [tooltipDataPoints, setTooltipDataPoints] = useState<
    PointWithAdditionalData[]
  >([]);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const xAxisConfig = useMemo(() => getAxisConfig(xAxis), [xAxis]);
  const yAxisConfig = useMemo(() => getAxisConfig(yAxis), [yAxis]);

  const chartRef = useRef<ChartJsChart | null>(null);
  const initialChartDataRef = useRef<{
    data: ChartData<"bubble">;
    options: ChartConfiguration<"bubble">["options"];
  } | null>(null);

  const chartData = useMemo<ChartData<"bubble">>(
    () => ({
      datasets: categorizedDataPoints.map((category) => ({
        label: getCategoryName(intl, category.category),
        data: category.dataPoints.map((dataPoint) => ({
          x: dataPoint.x,
          y: dataPoint.y,
          r: 10,
          additionalData: {
            groupName: dataPoint.groupName,
          } as AdditionalChartData,
        })),

        backgroundColor: getCanvasPattern(category.category),
      })),
    }),
    [categorizedDataPoints, intl],
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

  const annotations = useMemo<_DeepPartialObject<AnnotationPluginOptions>>(
    () => ({
      // allow annotations in axes
      clip: false,

      annotations: [
        ...(splittingEnabled ? splits : []).flatMap<AnnotationOptions>(
          (split) => {
            const onClickLabel = (ctx: EventContext, evt: ChartEvent) => {
              if (
                (evt.native && "handled" in evt.native) ||
                "blockDeletes" in ctx.chart
              ) {
                return;
              }

              // @ts-expect-error This is an annoying way working around the fact that stopImmediatePropagation doesn't work
              evt.native["handled"] = true;

              setSplits((splits) => splits.filter((s) => s !== split));
            };

            const labelProps = {
              type: "label" as const,
              content: "x",
              color: deleteLabelColor,
              backgroundColor: "rgb(255 255 255 / 1)",
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
                    backgroundColor: "rgba(255, 99, 132, 0.25)",
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
            content: group.label,
            color: groupLabelColor,
            xValue: (ctx) => {
              const min = Math.max(group.minX, ctx.chart.scales.x.min);
              const max = Math.min(group.maxX, ctx.chart.scales.x.max);

              return min + (max - min) / 2;
            },
            yValue: (ctx) => {
              const min = Math.max(group.minY, ctx.chart.scales.y.min);
              const max = Math.min(group.maxY, ctx.chart.scales.y.max);

              return min + (max - min) / 2;
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
      /* seems buggy */
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
    if (chart && chart.canvas) {
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

  const selectedXAxis = axisOptions.find((o) => o.value === xAxis);
  const selectedYAxis = axisOptions.find((o) => o.value === yAxis);

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
        <Tooltip ref={tooltipRef} isShown={tooltipDataPoints.length > 0}>
          {tooltipDataPoints.map((data, index) => (
            <div key={`${data.x}-${data.y}-${index}`}>
              <div className="data">
                <div>
                  <span>
                    <strong>{intl.formatMessage(messages.groupName)}</strong>
                  </span>
                  <span>
                    <strong>{data.additionalData.groupName}</strong>
                  </span>
                </div>
                <div>
                  <span>
                    {intl.formatMessage(selectedXAxis?.label ?? messages.xAxis)}
                  </span>
                  <span>{data.x}</span>
                </div>
                <div>
                  <span>
                    {intl.formatMessage(selectedYAxis?.label ?? messages.yAxis)}
                  </span>
                  <span>{data.y}</span>
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
