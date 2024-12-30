import { Col, Row } from "react-bootstrap";
import { useContext, useEffect, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import Select from "../form/Select";
import styled from "@emotion/styled";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import {
  AuthenticationContext,
  AuthenticationContextType,
} from "@/contexts/AuthenticationContext";
import { decodeBase64 } from "@/utilities/crypto/base64";
import CodeView, { CodeViewContainer } from "./CodeView";
import { TaskType } from "@/api/collimator/generated/models";
import ViewSolutionModal from "../modals/ViewSolutionModal";
import { Group, CategorizedDataPoint } from "./hooks/types";
import { getStudentNickname } from "@/utilities/student-name";
import Button from "../Button";
import { defaultGroupValue, defaultSolutionValue } from "./Analyzer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStrokeStar } from "@fortawesome/free-regular-svg-icons";
import { compareLabels } from "@/utilities/comparisons";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { AxesCriterionType, axisCriteria } from "./axes";

const messages = defineMessages({
  defaultGroupOption: {
    id: "CodeComparison.defaultOption",
    defaultMessage: "Group: All students",
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

const ModalFooter = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  gap: 1rem;
`;

type Option = { label: string; value: number };

const getOptions = async (
  authContext: AuthenticationContextType,
  analyses: CurrentAnalysis[],
  bookmarkedSolutionIds: number[],
): Promise<Option[]> => {
  let options: Option[] = analyses.map((analysis) => ({
    label: analysis.studentPseudonym,
    value: analysis.solutionId,
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
      const isBookmarked = bookmarkedSolutionIds.includes(option.value);

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
  selectedSolutionId: number,
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
        defaultGroupValue === selectedGroup
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
  subTaskId,
  taskType,
  categorizedDataPoints,
  groups,
  xAxis,
  yAxis,
  selectedLeftGroup,
  setSelectedLeftGroup,
  selectedRightGroup,
  setSelectedRightGroup,
  selectedLeftSolution,
  setSelectedLeftSolution,
  selectedRightSolution,
  setSelectedRightSolution,
  bookmarkedSolutionIds,
  setBookmarkedSolutionIds,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  subTaskId?: string;
  taskType: TaskType;
  categorizedDataPoints: CategorizedDataPoint[];
  groups: Group[];
  xAxis: AxesCriterionType;
  yAxis: AxesCriterionType;
  selectedLeftGroup: string;
  setSelectedLeftGroup: (group: string) => void;
  selectedRightGroup: string;
  setSelectedRightGroup: (group: string) => void;
  selectedLeftSolution: number;
  setSelectedLeftSolution: (solution: number) => void;
  selectedRightSolution: number;
  setSelectedRightSolution: (solution: number) => void;
  bookmarkedSolutionIds: number[];
  setBookmarkedSolutionIds: (bookmarkedSolutionIds: number[]) => void;
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
        selectedLeftSolution,
      ),
    [categorizedDataPoints, selectedLeftGroup, selectedLeftSolution],
  );

  const rightDataPoint = useMemo(
    () =>
      findAssignment(
        categorizedDataPoints,
        selectedRightGroup,
        selectedRightSolution,
      ),
    [categorizedDataPoints, selectedRightGroup, selectedRightSolution],
  );

  useEffect(() => {
    const analyses = categorizedDataPoints
      .filter(
        (s) =>
          selectedLeftGroup === defaultGroupValue ||
          s.groupKey === selectedLeftGroup,
      )
      .flatMap((point) => point.analyses);

    getOptions(authContext, analyses, bookmarkedSolutionIds).then((options) => {
      setLeftSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSolutionValue,
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
  ]);

  useEffect(() => {
    const analyses = categorizedDataPoints
      .filter(
        (s) =>
          selectedRightGroup === defaultGroupValue ||
          s.groupKey === selectedRightGroup,
      )
      .flatMap((point) => point.analyses);

    getOptions(authContext, analyses, bookmarkedSolutionIds).then((options) => {
      setRightSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSolutionValue,
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
  ]);

  useEffect(() => {
    if (selectedLeftSolution) {
      const leftGroup = groups.some((g) => g.groupKey === selectedLeftGroup);

      // leftDataPoint is already re-computed based on the current categorized data points
      // and therefore undefined if it no longer exists
      if (leftDataPoint) {
        // the solution may now be in a different group -> select that unless we previously selected
        // the default group (all)
        if (selectedLeftGroup !== defaultGroupValue) {
          setSelectedLeftGroup(leftDataPoint.dataPoint.groupKey);
        }
      } else if (leftGroup || selectedLeftGroup === defaultGroupValue) {
        // solution no longer exists but the group does => de-select the solution
        setSelectedLeftSolution(defaultSolutionValue);
      } else {
        // de-select the group and the solution if they no longer exists
        setSelectedLeftGroup(defaultGroupValue);
        setSelectedLeftSolution(defaultSolutionValue);
      }
    }

    if (selectedRightSolution) {
      const rightGroup = groups.some((g) => g.groupKey === selectedRightGroup);

      if (rightDataPoint) {
        if (selectedRightGroup !== defaultGroupValue) {
          setSelectedRightGroup(rightDataPoint.dataPoint.groupKey);
        }
      } else if (rightGroup || selectedRightGroup === defaultGroupValue) {
        setSelectedRightSolution(defaultSolutionValue);
      } else {
        setSelectedRightGroup(defaultGroupValue);
        setSelectedRightSolution(defaultSolutionValue);
      }
    }
    // this should only be triggerd if the groups change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, categorizedDataPoints]);

  const isLeftSolutionBookmarked = useMemo(
    () =>
      leftDataPoint
        ? bookmarkedSolutionIds.includes(leftDataPoint.analysis.solutionId)
        : false,
    [bookmarkedSolutionIds, leftDataPoint],
  );

  const isRightSolutionBookmarked = useMemo(
    () =>
      rightDataPoint
        ? bookmarkedSolutionIds.includes(rightDataPoint.analysis.solutionId)
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
          solutionId={modalDataPoint?.analysis.solutionId}
          footer={
            <ModalFooter>
              {xAxisLabel && (
                <div>
                  {intl.formatMessage(xAxisLabel)}: {modalDataPoint.dataPoint.x}
                </div>
              )}
              {yAxisLabel && (
                <div>
                  {intl.formatMessage(yAxisLabel)}: {modalDataPoint.dataPoint.y}
                </div>
              )}
            </ModalFooter>
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
                onChange={(e) => setSelectedLeftGroup(e.target.value)}
                alwaysShow
                noMargin
              />
              <Select
                options={leftSolutionOptions}
                value={selectedLeftSolution}
                onChange={(e) =>
                  setSelectedLeftSolution(parseInt(e.target.value))
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
                        setBookmarkedSolutionIds(
                          bookmarkedSolutionIds.filter(
                            (id) => id !== leftDataPoint.analysis.solutionId,
                          ),
                        );
                      } else {
                        setBookmarkedSolutionIds([
                          ...bookmarkedSolutionIds,
                          leftDataPoint.analysis.solutionId,
                        ]);
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
              <CodeView
                classId={classId}
                sessionId={sessionId}
                taskId={taskId}
                subTaskId={subTaskId}
                taskType={taskType}
                solutionId={leftDataPoint.analysis.solutionId}
              />
            ) : (
              <CodeViewContainer />
            )}
          </Col>
          <Col xs={6}>
            <SelectionMenu>
              <Select
                options={groupOptions}
                value={selectedRightGroup}
                onChange={(e) => setSelectedRightGroup(e.target.value)}
                alwaysShow
                noMargin
              />
              <Select
                options={rightSolutionOptions}
                value={selectedRightSolution}
                onChange={(e) =>
                  setSelectedRightSolution(parseInt(e.target.value))
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
                        setBookmarkedSolutionIds(
                          bookmarkedSolutionIds.filter(
                            (id) => id !== rightDataPoint.analysis.solutionId,
                          ),
                        );
                      } else {
                        setBookmarkedSolutionIds([
                          ...bookmarkedSolutionIds,
                          rightDataPoint.analysis.solutionId,
                        ]);
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
              <CodeView
                classId={classId}
                sessionId={sessionId}
                taskId={taskId}
                subTaskId={subTaskId}
                taskType={taskType}
                solutionId={rightDataPoint.analysis.solutionId}
              />
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
