import { useCallback, useMemo, useRef, useState } from "react";
import { AxesCriterionType, axisCriteria, getAxisConfig } from "./axes";
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
import { getCanvasPattern, getSuperGroupName } from "./super-group";
import { AnalyzedSuperGroup } from "./hooks/useGrouping";

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
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
  taskType,
  superGroups,
}: {
  xAxis: AxesCriterionType;
  setXAxis: (axis: AxesCriterionType) => void;
  yAxis: AxesCriterionType;
  setYAxis: (axis: AxesCriterionType) => void;
  taskType: TaskType;
  superGroups: AnalyzedSuperGroup[];
}) => {
  const intl = useIntl();

  const [tooltipDataPoints, setTooltipDataPoints] = useState<
    (BubbleDataPoint & {
      additionalData: AdditionalChartData;
    })[]
  >([]);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const xAxisConfig = useMemo(() => getAxisConfig(xAxis), [xAxis]);
  const yAxisConfig = useMemo(() => getAxisConfig(yAxis), [yAxis]);

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
                  {intl.formatMessage(selectedXAxis?.label ?? messages.xAxis)}:{" "}
                  {data.x}
                </div>
                <div>
                  {intl.formatMessage(selectedYAxis?.label ?? messages.yAxis)}:{" "}
                  {data.y}
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
