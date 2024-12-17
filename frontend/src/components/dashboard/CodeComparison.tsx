import { Button, Col, Row } from "react-bootstrap";
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
import { Group, SolutionGroupAssignment } from "./hooks/types";
import { getStudentNickname } from "@/utilities/student-name";

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

  & > * {
    /* avoid overflow */
    min-width: 0;
    flex-grow: 1;

    select {
      width: 100%;
    }
  }
`;

const defaultGroupValue = "null";
const defaultSolutionValue = -1;

type Option = { label: string; value: number };

const getOptions = async (
  authContext: AuthenticationContextType,
  solutions: SolutionGroupAssignment[],
): Promise<Option[]> => {
  let options: Option[] = solutions.map((solution) => ({
    label: solution.solution.studentPseudonym,
    value: solution.solution.id,
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

  return options;
};

const CodeComparison = ({
  classId,
  sessionId,
  taskId,
  subTaskId,
  taskType,
  groupAssignments,
  groups,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  subTaskId?: string;
  taskType: TaskType;
  groupAssignments: SolutionGroupAssignment[];
  groups: Group[];
}) => {
  const intl = useIntl();
  const authContext = useContext(AuthenticationContext);
  const [modalSolutionId, setModalSolutionId] = useState<number | null>(null);
  const [selectedLeftGroup, setSelectedLeftGroup] = useState(defaultGroupValue);
  const [selectedRightGroup, setSelectedRightGroup] =
    useState(defaultGroupValue);

  const [leftSolutionOptions, setLeftSolutionOptions] = useState<Option[]>([]);
  const [rightSolutionOptions, setRightSolutionOptions] = useState<Option[]>(
    [],
  );

  const [selectedRightSolution, setSelectedRightSolution] =
    useState(defaultSolutionValue);
  const [selectedLeftSolution, setSelectedLeftSolution] =
    useState(defaultSolutionValue);

  const groupOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(messages.defaultGroupOption),
        value: defaultGroupValue,
      },
      ...groups
        .map((g) => ({
          label: intl.formatMessage(messages.groupLabelPrefix) + g.label,
          value: g.key,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [intl, groups],
  );

  const leftSolution = useMemo(
    () =>
      groupAssignments.find(
        (s) =>
          (s.groupKey === selectedLeftGroup ||
            defaultGroupValue === selectedLeftGroup) &&
          s.solution.id === selectedLeftSolution,
      ),
    [groupAssignments, selectedLeftGroup, selectedLeftSolution],
  );

  const rightSolution = useMemo(
    () =>
      groupAssignments.find(
        (s) =>
          (s.groupKey === selectedRightGroup ||
            defaultGroupValue === selectedRightGroup) &&
          s.solution.id === selectedRightSolution,
      ),
    [groupAssignments, selectedRightGroup, selectedRightSolution],
  );

  useEffect(() => {
    const solutions = groupAssignments.filter(
      (s) =>
        selectedLeftGroup === defaultGroupValue ||
        s.groupKey === selectedLeftGroup,
    );

    getOptions(authContext, solutions).then((options) => {
      setLeftSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSolutionValue,
        },
        ...options,
      ]);
    });
  }, [intl, selectedLeftGroup, groupAssignments, authContext]);

  useEffect(() => {
    const solutions = groupAssignments.filter(
      (s) =>
        selectedRightGroup === defaultGroupValue ||
        s.groupKey === selectedRightGroup,
    );

    getOptions(authContext, solutions).then((options) => {
      setRightSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSolutionValue,
        },
        ...options,
      ]);
    });
  }, [intl, selectedRightGroup, groupAssignments, authContext]);

  useEffect(() => {
    if (selectedLeftSolution) {
      const leftSolution = groupAssignments.find(
        (s) => s.solution.id === selectedLeftSolution,
      );

      const leftGroup = groups.some((g) => g.key === selectedLeftGroup);

      if (leftSolution) {
        setSelectedLeftSolution(leftSolution.solution.id);
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
        (s) => s.solution.id === selectedRightSolution,
      );

      const rightGroup = groups.some((g) => g.key === selectedRightGroup);

      if (rightSolution) {
        setSelectedRightSolution(rightSolution.solution.id);
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
              {leftSolution && (
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();

                    setModalSolutionId(leftSolution.solution.id);
                  }}
                  data-testid={`left-view-button`}
                >
                  <FormattedMessage
                    id="CodeComparison.view"
                    defaultMessage="View"
                  />
                </Button>
              )}
            </SelectionMenu>
            {leftSolution && (
              <CodeView
                classId={classId}
                sessionId={sessionId}
                taskId={taskId}
                subTaskId={subTaskId}
                taskType={taskType}
                solutionId={leftSolution.solution.id}
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
              {rightSolution && (
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();

                    setModalSolutionId(rightSolution.solution.id);
                  }}
                  data-testid={`right-view-button`}
                >
                  <FormattedMessage
                    id="CodeComparison.view"
                    defaultMessage="View"
                  />
                </Button>
              )}
            </SelectionMenu>
            {rightSolution && (
              <CodeView
                classId={classId}
                sessionId={sessionId}
                taskId={taskId}
                subTaskId={subTaskId}
                taskType={taskType}
                solutionId={rightSolution.solution.id}
              />
            )}
          </Col>
        </Row>
      </CodeComparisonWrapper>
    </>
  );
};

export default CodeComparison;
