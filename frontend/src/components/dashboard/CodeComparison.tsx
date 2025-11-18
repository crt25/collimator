import { Dispatch, useContext, useEffect, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { Grid, GridItem } from "@chakra-ui/react";
import { getStudentNickname } from "@/utilities/student-name";
import { TaskType } from "@/api/collimator/generated/models";
import { decodeBase64 } from "@/utilities/crypto/base64";
import {
  AuthenticationContext,
  AuthenticationContextType,
  isFullyAuthenticated,
} from "@/contexts/AuthenticationContext";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { compareLabels } from "@/utilities/comparisons";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "@/api/collimator/models/solutions/reference-analysis";
import { useStudentAnonymization } from "@/hooks/useStudentAnonymization";
import Button from "../Button";
import ViewSolutionModal from "../modals/ViewSolutionModal";
import Select from "../form/Select";
import { Group, CategorizedDataPoint } from "./hooks/types";
import CodeView, { CodeViewContainer } from "./CodeView";
import { axisCriteria } from "./axes";
import {
  AnalyzerState,
  AnalyzerStateAction,
  AnalyzerStateActionType,
  defaultGroupValue,
  defaultSolutionIdValue,
  selectedGroupValue,
} from "./Analyzer.state";
import StarAnalysisButton from "./StarAnalysisButton";

const messages = defineMessages({
  defaultGroupOption: {
    id: "CodeComparison.defaultOption",
    defaultMessage: "Group: All solutions",
  },
  selectedSolutions: {
    id: "CodeComparison.selectedSolutions",
    defaultMessage: "Group: Selected solutions",
  },
  groupLabelPrefix: {
    id: "CodeComparison.groupPrefix",
    defaultMessage: "Group: ",
  },
  defaultSolutionOption: {
    id: "CodeComparison.defaultSolutionOption",
    defaultMessage: "Select a solutions",
  },
});

const CodeComparisonWrapper = styled.div`
  margin-bottom: 2rem;
`;

const SelectionMenu = styled.div`
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;

  margin-bottom: 1rem;

  & > label:first-of-type {
    /* the group select should not shrink */
    flex-shrink: 0;
  }

  & > label:nth-of-type(2) {
    /* make student select take up remaining space */
    flex-grow: 1;
  }

  & > * {
    /* avoid overflow */
    min-width: 0;

    select {
      width: 100%;
    }
  }
`;

const ModalHeader = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ModalHeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  margin-left: 1rem;
  gap: 1rem;
`;

const AxisValues = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  gap: 1rem;
`;

type Option = { label: string; value: string };

const getOptions = async (
  authContext: AuthenticationContextType,
  analyses: CurrentAnalysis[],
  showStudentName: boolean,
): Promise<Option[]> => {
  const options = await Promise.all(
    analyses.map(async (analysis) => {
      if (analysis instanceof CurrentStudentAnalysis) {
        const {
          studentId,
          studentPseudonym,
          isReferenceSolution,
          solutionId: value,
        } = analysis;

        let label = getStudentNickname(studentId, studentPseudonym);

        if (
          showStudentName &&
          studentPseudonym &&
          isFullyAuthenticated(authContext)
        ) {
          try {
            const decryptedIdentity: StudentIdentity = JSON.parse(
              await authContext.keyPair.decryptString(
                decodeBase64(studentPseudonym),
              ),
            );

            label = decryptedIdentity.name;
          } catch {
            // if decryption fails, use the nickname
          }
        }

        return {
          label: isReferenceSolution ? `⭐ ${label}` : label,
          value,
        };
      }

      if (analysis instanceof ReferenceAnalysis) {
        return {
          label: `𝓡 ${analysis.title}`,
          value: analysis.solutionId,
        };
      }

      throw new Error(`Unknown analysis type: ${JSON.stringify(analysis)}`);
    }),
  );

  return options.toSorted(compareLabels);
};

const findAssignment = (
  categorizedDataPoints: CategorizedDataPoint[],
  selectedGroup: string,
  selectedSolutionId: string,
):
  | {
      dataPoint: CategorizedDataPoint;
      analysis: CurrentAnalysis;
    }
  | undefined =>
  categorizedDataPoints
    .map((dataPoint) => {
      if (
        dataPoint.groupKey === selectedGroup ||
        defaultGroupValue === selectedGroup ||
        selectedGroupValue === selectedGroup
      ) {
        const analysis = dataPoint.analyses.find(
          (analysis) => analysis.solutionId === selectedSolutionId,
        );

        if (analysis) {
          return {
            dataPoint,
            analysis,
          };
        }
      }

      return null;
    })
    .find((analysis) => analysis !== null);

const CodeComparison = ({
  classId,
  sessionId,
  taskId,
  taskType,
  state: {
    selectedSolutionIds,
    comparison: {
      selectedLeftGroup,
      selectedLeftSolutionId,
      selectedRightGroup,
      selectedRightSolutionId,
    },
    selectedSubTaskId,
    xAxis,
    yAxis,
  },
  dispatch,
  categorizedDataPoints,
  groups,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  taskType: TaskType;
  state: AnalyzerState;
  dispatch: Dispatch<AnalyzerStateAction>;
  categorizedDataPoints: CategorizedDataPoint[];
  groups: Group[];
}) => {
  const intl = useIntl();
  const authContext = useContext(AuthenticationContext);
  const [anonymizationState] = useStudentAnonymization();
  const [modalSide, setModalSide] = useState<"left" | "right" | null>(null);

  const [leftOptions, setLeftOptions] = useState<Option[]>([]);
  const [rightOptions, setRightOptions] = useState<Option[]>([]);

  const groupOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(messages.defaultGroupOption),
        value: defaultGroupValue,
      },
      {
        label: intl.formatMessage(messages.selectedSolutions),
        value: selectedGroupValue,
      },
      ...groups
        .map((g) => ({
          label: intl.formatMessage(messages.groupLabelPrefix) + g.groupLabel,
          value: g.groupKey,
        }))
        .toSorted(compareLabels),
    ],
    [intl, groups],
  );

  const leftDataPoint = useMemo(
    () =>
      findAssignment(
        categorizedDataPoints,
        selectedLeftGroup,
        selectedLeftSolutionId,
      ),
    [categorizedDataPoints, selectedLeftGroup, selectedLeftSolutionId],
  );

  const rightDataPoint = useMemo(
    () =>
      findAssignment(
        categorizedDataPoints,
        selectedRightGroup,
        selectedRightSolutionId,
      ),
    [categorizedDataPoints, selectedRightGroup, selectedRightSolutionId],
  );

  useEffect(() => {
    const analyses = categorizedDataPoints
      .filter(
        (s) =>
          selectedLeftGroup === defaultGroupValue ||
          selectedLeftGroup === selectedGroupValue ||
          selectedLeftGroup === s.groupKey,
      )
      .flatMap((point) =>
        point.analyses.filter(
          (analysis) =>
            // either we are not looking for the manually selected data points
            selectedLeftGroup !== selectedGroupValue ||
            // or the analysis is manually selected
            selectedSolutionIds.has(analysis.solutionId),
        ),
      );

    let isCancelled = false;

    getOptions(authContext, analyses, anonymizationState.showActualName).then(
      (options) => {
        if (isCancelled) {
          return;
        }

        setLeftOptions([
          {
            label: intl.formatMessage(messages.defaultSolutionOption),
            value: defaultSolutionIdValue,
          },
          ...options,
        ]);
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [
    intl,
    anonymizationState.showActualName,
    categorizedDataPoints,
    selectedLeftGroup,
    authContext,
    selectedSolutionIds,
  ]);

  useEffect(() => {
    const analyses = categorizedDataPoints
      .filter(
        (s) =>
          selectedRightGroup === defaultGroupValue ||
          selectedRightGroup === selectedGroupValue ||
          selectedRightGroup === s.groupKey,
      )
      .flatMap((point) =>
        point.analyses.filter(
          (analysis) =>
            // either we are not looking for the manually selected data points
            selectedRightGroup !== selectedGroupValue ||
            // or the analysis is manually selected
            selectedSolutionIds.has(analysis.solutionId),
        ),
      );

    let isCancelled = false;

    getOptions(authContext, analyses, anonymizationState.showActualName).then(
      (options) => {
        if (isCancelled) {
          return;
        }

        setRightOptions([
          {
            label: intl.formatMessage(messages.defaultSolutionOption),
            value: defaultSolutionIdValue,
          },
          ...options,
        ]);

        return () => {
          isCancelled = true;
        };
      },
    );
  }, [
    intl,
    anonymizationState.showActualName,
    categorizedDataPoints,
    selectedRightGroup,
    authContext,
    selectedSolutionIds,
  ]);

  useEffect(() => {
    if (selectedLeftSolutionId) {
      const leftGroup = groups.some((g) => g.groupKey === selectedLeftGroup);

      // leftDataPoint is already re-computed based on the current categorized data points
      // and therefore undefined if it no longer exists
      if (leftDataPoint) {
        // the solution may now be in a different group -> select that unless we previously selected
        // the default group (all) OR the group of selected solutions
        if (
          ![defaultGroupValue, selectedGroupValue].includes(selectedLeftGroup)
        ) {
          dispatch({
            type: AnalyzerStateActionType.setSelectedLeftGroup,
            groupKey: leftDataPoint.dataPoint.groupKey,
          });
        }
      } else if (leftGroup || selectedLeftGroup === defaultGroupValue) {
        // solution no longer exists but the group does => de-select the solution
        dispatch({
          type: AnalyzerStateActionType.setSelectedLeftAnalysis,
          solutionId: defaultSolutionIdValue,
        });
      } else {
        // de-select the group and the solution if they no longer exists
        dispatch({
          type: AnalyzerStateActionType.setSelectedLeft,
          groupKey: defaultGroupValue,
          solutionId: defaultSolutionIdValue,
        });
      }
    }

    if (selectedRightSolutionId) {
      const rightGroup = groups.some((g) => g.groupKey === selectedRightGroup);

      if (rightDataPoint) {
        if (
          ![defaultGroupValue, selectedGroupValue].includes(selectedRightGroup)
        ) {
          dispatch({
            type: AnalyzerStateActionType.setSelectedRightGroup,
            groupKey: rightDataPoint.dataPoint.groupKey,
          });
        }
      } else if (rightGroup || selectedRightGroup === defaultGroupValue) {
        dispatch({
          type: AnalyzerStateActionType.setSelectedRightAnalysis,
          solutionId: defaultSolutionIdValue,
        });
      } else {
        dispatch({
          type: AnalyzerStateActionType.setSelectedRight,
          groupKey: defaultGroupValue,
          solutionId: defaultSolutionIdValue,
        });
      }
    }
    // this should only be triggerd if the groups change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, categorizedDataPoints]);

  const modalDataPoint = useMemo(() => {
    if (!modalSide) {
      return null;
    }

    if (modalSide === "left") {
      return leftDataPoint;
    } else {
      return rightDataPoint;
    }
  }, [leftDataPoint, rightDataPoint, modalSide]);

  const xAxisLabel = useMemo(
    () =>
      axisCriteria.find((c) => c.criterion === xAxis)?.messages(taskType).name,
    [xAxis, taskType],
  );

  const yAxisLabel = useMemo(
    () =>
      axisCriteria.find((c) => c.criterion === yAxis)?.messages(taskType).name,
    [yAxis, taskType],
  );

  const leftStudentName = useMemo(
    () =>
      leftOptions.find((o) => o.value === selectedLeftSolutionId)?.label ?? "",
    [leftOptions, selectedLeftSolutionId],
  );

  const rightStudentName = useMemo(
    () =>
      rightOptions.find((o) => o.value === selectedRightSolutionId)?.label ??
      "",
    [rightOptions, selectedRightSolutionId],
  );

  return (
    <>
      {modalDataPoint && (
        <ViewSolutionModal
          isShown={true}
          setIsShown={(isShown) => setModalSide(isShown ? modalSide : null)}
          classId={classId}
          sessionId={sessionId}
          taskId={taskId}
          taskType={taskType}
          solutionHash={modalDataPoint?.analysis.solutionHash}
          footer={
            <ModalHeader>
              <ModalHeaderLeft>
                {selectedLeftSolutionId !== defaultSolutionIdValue &&
                selectedRightSolutionId !== defaultSolutionIdValue ? (
                  <div>
                    <Button
                      onClick={() => {
                        setModalSide("left");
                      }}
                    >
                      {leftStudentName}
                    </Button>
                    <Button
                      onClick={() => {
                        setModalSide("right");
                      }}
                    >
                      {rightStudentName}
                    </Button>
                  </div>
                ) : null}
                <AxisValues>
                  {xAxisLabel && (
                    <div>
                      {intl.formatMessage(xAxisLabel)}:{" "}
                      {modalDataPoint.dataPoint.x}
                    </div>
                  )}
                  {yAxisLabel && (
                    <div>
                      {intl.formatMessage(yAxisLabel)}:{" "}
                      {modalDataPoint.dataPoint.y}
                    </div>
                  )}
                </AxisValues>
              </ModalHeaderLeft>
            </ModalHeader>
          }
        />
      )}
      <CodeComparisonWrapper>
        <h2>
          <FormattedMessage
            id="CodeComparison.heading"
            defaultMessage="Comparison"
          />
        </h2>

        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={6}>
            <SelectionMenu>
              <Select
                options={groupOptions}
                value={selectedLeftGroup}
                onChange={(e) =>
                  dispatch({
                    type: AnalyzerStateActionType.setSelectedLeftGroup,
                    groupKey: e.target.value,
                  })
                }
                alwaysShow
                noMargin
              />
              <Select
                options={leftOptions}
                value={selectedLeftSolutionId}
                onChange={(e) =>
                  dispatch({
                    type: AnalyzerStateActionType.setSelectedLeftAnalysis,
                    solutionId: e.target.value,
                  })
                }
                alwaysShow
                noMargin
              />
              {leftDataPoint && (
                <>
                  <Button
                    onClick={() => {
                      setModalSide("left");
                    }}
                    data-testid="left-view-button"
                  >
                    <FormattedMessage
                      id="CodeComparison.view"
                      defaultMessage="View"
                    />
                  </Button>
                  <StarAnalysisButton
                    analysis={leftDataPoint.analysis}
                    classId={classId}
                    testId="left-bookmark-button"
                  />
                </>
              )}
            </SelectionMenu>
            {leftDataPoint ? (
              <div>
                <AxisValues>
                  {xAxisLabel && (
                    <div>
                      {intl.formatMessage(xAxisLabel)}:{" "}
                      {leftDataPoint.dataPoint.x}
                    </div>
                  )}
                  {yAxisLabel && (
                    <div>
                      {intl.formatMessage(yAxisLabel)}:{" "}
                      {leftDataPoint.dataPoint.y}
                    </div>
                  )}
                </AxisValues>
                <CodeView
                  classId={classId}
                  sessionId={sessionId}
                  taskId={taskId}
                  subTaskId={selectedSubTaskId}
                  taskType={taskType}
                  solutionHash={leftDataPoint.analysis.solutionHash}
                />
              </div>
            ) : (
              <CodeViewContainer />
            )}
          </GridItem>
          <GridItem colSpan={6}>
            <SelectionMenu>
              <Select
                options={groupOptions}
                value={selectedRightGroup}
                onChange={(e) =>
                  dispatch({
                    type: AnalyzerStateActionType.setSelectedRightGroup,
                    groupKey: e.target.value,
                  })
                }
                alwaysShow
                noMargin
              />
              <Select
                options={rightOptions}
                value={selectedRightSolutionId}
                onChange={(e) =>
                  dispatch({
                    type: AnalyzerStateActionType.setSelectedRightAnalysis,
                    solutionId: e.target.value,
                  })
                }
                alwaysShow
                noMargin
              />
              {rightDataPoint && (
                <>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();

                      setModalSide("right");
                    }}
                    data-testid="right-view-button"
                  >
                    <FormattedMessage
                      id="CodeComparison.view"
                      defaultMessage="View"
                    />
                  </Button>
                  <StarAnalysisButton
                    analysis={rightDataPoint.analysis}
                    classId={classId}
                    testId="right-bookmark-button"
                  />
                </>
              )}
            </SelectionMenu>
            {rightDataPoint ? (
              <div>
                <AxisValues>
                  {xAxisLabel && (
                    <div>
                      {intl.formatMessage(xAxisLabel)}:{" "}
                      {rightDataPoint.dataPoint.x}
                    </div>
                  )}
                  {yAxisLabel && (
                    <div>
                      {intl.formatMessage(yAxisLabel)}:{" "}
                      {rightDataPoint.dataPoint.y}
                    </div>
                  )}
                </AxisValues>
                <CodeView
                  classId={classId}
                  sessionId={sessionId}
                  taskId={taskId}
                  subTaskId={selectedSubTaskId}
                  taskType={taskType}
                  solutionHash={rightDataPoint.analysis.solutionHash}
                />
              </div>
            ) : (
              <CodeViewContainer />
            )}
          </GridItem>
        </Grid>
      </CodeComparisonWrapper>
    </>
  );
};

export default CodeComparison;
