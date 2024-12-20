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
import CodeView from "./CodeView";
import { TaskType } from "@/api/collimator/generated/models";
import ViewSolutionModal from "../modals/ViewSolutionModal";
import { Group, AnalysisGroupAssignment } from "./hooks/types";
import { getStudentNickname } from "@/utilities/student-name";
import Button from "../Button";
import { defaultGroupValue, defaultSolutionValue } from "./Analyzer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStrokeStar } from "@fortawesome/free-regular-svg-icons";

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

type Option = { label: string; value: number };

const getOptions = async (
  authContext: AuthenticationContextType,
  assignments: AnalysisGroupAssignment[],
  bookmarkedSolutionIds: number[],
): Promise<Option[]> => {
  let options: Option[] = assignments.map((assignment) => ({
    label: assignment.analysis.studentPseudonym,
    value: assignment.analysis.solutionId,
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

  return options.map((option) => {
    const isBookmarked = bookmarkedSolutionIds.includes(option.value);

    return {
      ...option,
      label: isBookmarked ? `⭐ ${option.label}` : option.label,
    };
  });
};

const CodeComparison = ({
  classId,
  sessionId,
  taskId,
  subTaskId,
  taskType,
  groupAssignments,
  groups,
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
  groupAssignments: AnalysisGroupAssignment[];
  groups: Group[];
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
  const [modalSolutionId, setModalSolutionId] = useState<number | null>(null);

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
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [intl, groups],
  );

  const leftAssignment = useMemo(
    () =>
      groupAssignments.find(
        (s) =>
          (s.groupKey === selectedLeftGroup ||
            defaultGroupValue === selectedLeftGroup) &&
          s.analysis.solutionId === selectedLeftSolution,
      ),
    [groupAssignments, selectedLeftGroup, selectedLeftSolution],
  );

  const rightAssignment = useMemo(
    () =>
      groupAssignments.find(
        (s) =>
          (s.groupKey === selectedRightGroup ||
            defaultGroupValue === selectedRightGroup) &&
          s.analysis.solutionId === selectedRightSolution,
      ),
    [groupAssignments, selectedRightGroup, selectedRightSolution],
  );

  useEffect(() => {
    const solutions = groupAssignments.filter(
      (s) =>
        selectedLeftGroup === defaultGroupValue ||
        s.groupKey === selectedLeftGroup,
    );

    getOptions(authContext, solutions, bookmarkedSolutionIds).then(
      (options) => {
        setLeftSolutionOptions([
          {
            label: intl.formatMessage(messages.defaultSolutionOption),
            value: defaultSolutionValue,
          },
          ...options,
        ]);
      },
    );
  }, [
    intl,
    selectedLeftGroup,
    groupAssignments,
    authContext,
    bookmarkedSolutionIds,
  ]);

  useEffect(() => {
    const solutions = groupAssignments.filter(
      (s) =>
        selectedRightGroup === defaultGroupValue ||
        s.groupKey === selectedRightGroup,
    );

    getOptions(authContext, solutions, bookmarkedSolutionIds).then(
      (options) => {
        setRightSolutionOptions([
          {
            label: intl.formatMessage(messages.defaultSolutionOption),
            value: defaultSolutionValue,
          },
          ...options,
        ]);
      },
    );
  }, [
    intl,
    selectedRightGroup,
    groupAssignments,
    authContext,
    bookmarkedSolutionIds,
  ]);

  useEffect(() => {
    if (selectedLeftSolution) {
      const leftSolution = groupAssignments.find(
        (s) => s.analysis.solutionId === selectedLeftSolution,
      );

      const leftGroup = groups.some((g) => g.groupKey === selectedLeftGroup);

      if (leftSolution) {
        setSelectedLeftSolution(leftSolution.analysis.solutionId);
        if (selectedLeftGroup !== defaultGroupValue) {
          setSelectedLeftGroup(leftSolution.groupKey);
        }
      } else if (leftGroup || selectedLeftGroup === defaultGroupValue) {
        // de-select the solution if it no longer exists
        setSelectedLeftSolution(defaultSolutionValue);
      } else {
        // de-select the group and the solution if they no longer exists
        setSelectedLeftGroup(defaultGroupValue);
        setSelectedLeftSolution(defaultSolutionValue);
      }
    }

    if (selectedRightSolution) {
      const rightSolution = groupAssignments.find(
        (s) => s.analysis.solutionId === selectedRightSolution,
      );

      const rightGroup = groups.some((g) => g.groupKey === selectedRightGroup);

      if (rightSolution) {
        setSelectedRightSolution(rightSolution.analysis.solutionId);
        if (selectedRightGroup !== defaultGroupValue) {
          setSelectedRightGroup(rightSolution.groupKey);
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
  }, [groups, groupAssignments]);

  const isLeftSolutionBookmarked = useMemo(
    () =>
      leftAssignment
        ? bookmarkedSolutionIds.includes(leftAssignment.analysis.solutionId)
        : false,
    [bookmarkedSolutionIds, leftAssignment],
  );

  const isRightSolutionBookmarked = useMemo(
    () =>
      rightAssignment
        ? bookmarkedSolutionIds.includes(rightAssignment.analysis.solutionId)
        : false,
    [bookmarkedSolutionIds, rightAssignment],
  );

  return (
    <>
      {modalSolutionId && (
        <ViewSolutionModal
          isShown={modalSolutionId !== null}
          setIsShown={(isShown) =>
            setModalSolutionId(isShown ? modalSolutionId : null)
          }
          classId={classId}
          sessionId={sessionId}
          taskId={taskId}
          taskType={taskType}
          solutionId={modalSolutionId}
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
              {leftAssignment && (
                <>
                  <Button
                    onClick={() => {
                      setModalSolutionId(leftAssignment.analysis.solutionId);
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
                            (id) => id !== leftAssignment.analysis.solutionId,
                          ),
                        );
                      } else {
                        setBookmarkedSolutionIds([
                          ...bookmarkedSolutionIds,
                          leftAssignment.analysis.solutionId,
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
            {leftAssignment && (
              <CodeView
                classId={classId}
                sessionId={sessionId}
                taskId={taskId}
                subTaskId={subTaskId}
                taskType={taskType}
                solutionId={leftAssignment.analysis.solutionId}
              />
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
              {rightAssignment && (
                <>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();

                      setModalSolutionId(rightAssignment.analysis.solutionId);
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
                            (id) => id !== rightAssignment.analysis.solutionId,
                          ),
                        );
                      } else {
                        setBookmarkedSolutionIds([
                          ...bookmarkedSolutionIds,
                          rightAssignment.analysis.solutionId,
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
            {rightAssignment && (
              <CodeView
                classId={classId}
                sessionId={sessionId}
                taskId={taskId}
                subTaskId={subTaskId}
                taskType={taskType}
                solutionId={rightAssignment.analysis.solutionId}
              />
            )}
          </Col>
        </Row>
      </CodeComparisonWrapper>
    </>
  );
};

export default CodeComparison;
