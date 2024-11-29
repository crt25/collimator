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
import { Group, SolutionGroupAssignment } from "./hooks/grouping";

const messages = defineMessages({
  defaultGroupOption: {
    id: "CodeComparison.defaultOption",
    defaultMessage: "Select a group",
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
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;

  margin-bottom: 1rem;
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

  if ("keyPair" in authContext) {
    try {
      options = await Promise.all(
        options.map(async ({ label, value }) => {
          const decryptedIdentity: StudentIdentity = JSON.parse(
            await authContext.keyPair.decryptString(decodeBase64(label)),
          );

          return {
            label: decryptedIdentity.name,
            value,
          };
        }),
      );
    } catch {
      // if decryption fails, use the pseudonym strings
    }
  }

  return options;
};

const CodeComparison = ({
  classId,
  sessionId,
  taskId,
  taskType,
  groupAssignments,
  groups,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
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
      ...groups.map((g) => ({
        label: g.label,
        value: g.key,
      })),
    ],
    [intl, groups],
  );

  const leftSolution = useMemo(
    () =>
      groupAssignments.find(
        (s) =>
          s.groupKey === selectedLeftGroup &&
          s.solution.id === selectedLeftSolution,
      ),
    [groupAssignments, selectedLeftGroup, selectedLeftSolution],
  );

  const rightSolution = useMemo(
    () =>
      groupAssignments.find(
        (s) =>
          s.groupKey === selectedRightGroup &&
          s.solution.id === selectedRightSolution,
      ),
    [groupAssignments, selectedRightGroup, selectedRightSolution],
  );

  useEffect(() => {
    const solutions = groupAssignments.filter(
      (s) => s.groupKey === selectedLeftGroup,
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
      (s) => s.groupKey === selectedRightGroup,
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

      if (leftSolution) {
        setSelectedLeftGroup(leftSolution.groupKey);
        setSelectedLeftSolution(leftSolution.solution.id);
      } else {
        setSelectedLeftGroup(defaultGroupValue);
        setSelectedLeftSolution(defaultSolutionValue);
      }
    }

    if (selectedRightSolution) {
      const rightSolution = groupAssignments.find(
        (s) => s.solution.id === selectedRightSolution,
      );

      if (rightSolution) {
        setSelectedRightGroup(rightSolution.groupKey);
        setSelectedRightSolution(rightSolution.solution.id);
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
