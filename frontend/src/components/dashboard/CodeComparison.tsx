import { ButtonGroup, Col, Row } from "react-bootstrap";
import { Dispatch, useContext, useEffect, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStrokeStar } from "@fortawesome/free-regular-svg-icons";
import { getStudentNickname } from "@/utilities/student-name";
import { TaskType } from "@/api/collimator/generated/models";
import { decodeBase64 } from "@/utilities/crypto/base64";
import {
  AuthenticationContext,
  AuthenticationContextType,
} from "@/contexts/AuthenticationContext";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { compareLabels } from "@/utilities/comparisons";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
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
  defaultSourceValue,
  selectedGroupValue,
} from "./Analyzer.state";

const messages = defineMessages({
  defaultGroupOption: {
    id: "CodeComparison.defaultOption",
    defaultMessage: "Group: All students",
  },
  selectedSolutions: {
    id: "CodeComparison.selectedSolutions",
    defaultMessage: "Group: Selected students",
  },
  groupLabelPrefix: {
    id: "CodeComparison.groupPrefix",
    defaultMessage: "Group: ",
  },
  defaultSolutionOption: {
    id: "CodeComparison.defaultSolutionOption",
    defaultMessage: "Select a student",
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
  bookmarkedSourceIds: Set<string>,
): Promise<Option[]> => {
  let options: Option[] = analyses
    .filter((analysis) => analysis instanceof CurrentStudentAnalysis)
    .map((analysis) => ({
      label: analysis.studentPseudonym,
      value: analysis.sourceId,
    }));

  // TODO: && this with a parameter
  const showStudentName = false && "keyPair" in authContext;

  options = await Promise.all(
    options.map(async ({ label, value }) => {
      if (showStudentName) {
        try {
          const decryptedIdentity: StudentIdentity = JSON.parse(
            await authContext.keyPair.decryptString(decodeBase64(label)),
          );

          return {
            label: decryptedIdentity.name,
            value,
          };
        } catch {
          // if decryption fails, use the nickname
        }
      }

      return {
        label: getStudentNickname(label),
        value,
      };
    }),
  );

  return options
    .map((option) => {
      const isBookmarked = bookmarkedSourceIds.has(option.value);

      return {
        ...option,
        label: isBookmarked ? `⭐ ${option.label}` : option.label,
      };
    })
    .toSorted(compareLabels);
};

const findAssignment = (
  categorizedDataPoints: CategorizedDataPoint[],
  selectedGroup: string,
  selectedSourceId: string,
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
          (analysis) => analysis.sourceId === selectedSourceId,
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
    selectedSourceIds,
    comparison: {
      selectedLeftGroup,
      selectedLeftSourceId,
      selectedRightGroup,
      selectedRightSourceId,
    },
    bookmarkedSourceIds: bookmarkedSolutionIds,
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
  const [modalSide, setModalSide] = useState<"left" | "right" | null>(null);

  const [leftSolutionOptions, setLeftSolutionOptions] = useState<Option[]>([]);
  const [rightSolutionOptions, setRightSolutionOptions] = useState<Option[]>(
    [],
  );

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
        selectedLeftSourceId,
      ),
    [categorizedDataPoints, selectedLeftGroup, selectedLeftSourceId],
  );

  const rightDataPoint = useMemo(
    () =>
      findAssignment(
        categorizedDataPoints,
        selectedRightGroup,
        selectedRightSourceId,
      ),
    [categorizedDataPoints, selectedRightGroup, selectedRightSourceId],
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
            // either we are not looking for the selected solutions
            selectedLeftGroup !== selectedGroupValue ||
            // or the solution is manually selected
            selectedSourceIds.has(analysis.sourceId),
        ),
      );

    getOptions(authContext, analyses, bookmarkedSolutionIds).then((options) => {
      setLeftSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSourceValue,
        },
        ...options,
      ]);
    });
  }, [
    intl,
    categorizedDataPoints,
    selectedLeftGroup,
    authContext,
    bookmarkedSolutionIds,
    selectedSourceIds,
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
            // either we are not looking for the selected solutions
            selectedRightGroup !== selectedGroupValue ||
            // or the solution is manually selected
            selectedSourceIds.has(analysis.sourceId),
        ),
      );

    getOptions(authContext, analyses, bookmarkedSolutionIds).then((options) => {
      setRightSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSourceValue,
        },
        ...options,
      ]);
    });
  }, [
    intl,
    categorizedDataPoints,
    selectedRightGroup,
    authContext,
    bookmarkedSolutionIds,
    selectedSourceIds,
  ]);

  useEffect(() => {
    if (selectedLeftSourceId) {
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
          sourceId: defaultSourceValue,
        });
      } else {
        // de-select the group and the solution if they no longer exists
        dispatch({
          type: AnalyzerStateActionType.setSelectedLeft,
          groupKey: defaultGroupValue,
          sourceId: defaultSourceValue,
        });
      }
    }

    if (selectedRightSourceId) {
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
          sourceId: defaultSourceValue,
        });
      } else {
        dispatch({
          type: AnalyzerStateActionType.setSelectedRight,
          groupKey: defaultGroupValue,
          sourceId: defaultSourceValue,
        });
      }
    }
    // this should only be triggerd if the groups change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, categorizedDataPoints]);

  const isLeftSolutionBookmarked = useMemo(
    () =>
      leftDataPoint
        ? bookmarkedSolutionIds.has(leftDataPoint.analysis.sourceId)
        : false,
    [bookmarkedSolutionIds, leftDataPoint],
  );

  const isRightSolutionBookmarked = useMemo(
    () =>
      rightDataPoint
        ? bookmarkedSolutionIds.has(rightDataPoint.analysis.sourceId)
        : false,
    [bookmarkedSolutionIds, rightDataPoint],
  );

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
      leftSolutionOptions.find((o) => o.value === selectedLeftSourceId)
        ?.label ?? "",
    [leftSolutionOptions, selectedLeftSourceId],
  );

  const rightStudentName = useMemo(
    () =>
      rightSolutionOptions.find((o) => o.value === selectedRightSourceId)
        ?.label ?? "",
    [rightSolutionOptions, selectedRightSourceId],
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
                {selectedLeftSourceId !== defaultSourceValue &&
                selectedRightSourceId !== defaultSourceValue ? (
                  <ButtonGroup>
                    <Button
                      active={modalSide === "left"}
                      onClick={() => {
                        setModalSide("left");
                      }}
                    >
                      {leftStudentName}
                    </Button>
                    <Button
                      active={modalSide === "right"}
                      onClick={() => {
                        setModalSide("right");
                      }}
                    >
                      {rightStudentName}
                    </Button>
                  </ButtonGroup>
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

        <Row>
          <Col xs={6}>
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
                options={leftSolutionOptions}
                value={selectedLeftSourceId}
                onChange={(e) =>
                  dispatch({
                    type: AnalyzerStateActionType.setSelectedLeftAnalysis,
                    sourceId: e.target.value,
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
                  <Button
                    onClick={() => {
                      if (isLeftSolutionBookmarked) {
                        dispatch({
                          type: AnalyzerStateActionType.removeBookmarkedAnalysis,
                          sourceId: leftDataPoint.analysis.sourceId,
                        });
                      } else {
                        dispatch({
                          type: AnalyzerStateActionType.addBookmarkedAnalysis,
                          sourceId: leftDataPoint.analysis.sourceId,
                        });
                      }
                    }}
                    data-testid="left-bookmark-button"
                  >
                    <FontAwesomeIcon
                      icon={
                        isLeftSolutionBookmarked ? faSolidStar : faStrokeStar
                      }
                    />
                  </Button>
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
          </Col>
          <Col xs={6}>
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
                options={rightSolutionOptions}
                value={selectedRightSourceId}
                onChange={(e) =>
                  dispatch({
                    type: AnalyzerStateActionType.setSelectedRightAnalysis,
                    sourceId: e.target.value,
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
                  <Button
                    onClick={() => {
                      if (isRightSolutionBookmarked) {
                        dispatch({
                          type: AnalyzerStateActionType.removeBookmarkedAnalysis,
                          sourceId: rightDataPoint.analysis.sourceId,
                        });
                      } else {
                        dispatch({
                          type: AnalyzerStateActionType.addBookmarkedAnalysis,
                          sourceId: rightDataPoint.analysis.sourceId,
                        });
                      }
                    }}
                    data-testid="left-bookmark-button"
                  >
                    <FontAwesomeIcon
                      icon={
                        isRightSolutionBookmarked ? faSolidStar : faStrokeStar
                      }
                    />
                  </Button>
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
          </Col>
        </Row>
      </CodeComparisonWrapper>
    </>
  );
};

export default CodeComparison;
