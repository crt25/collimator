import { Button, Col, Row } from "react-bootstrap";
import { useContext, useEffect, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { AnalyzedGroup, AnalyzedSuperGroup } from "./hooks/useGrouping";
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
import EditTaskModal from "../modals/EditTaskModal";
import ViewSolutionModal from "../modals/ViewSolutionModal";

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
  group?: AnalyzedGroup,
): Promise<Option[]> => {
  if (!group) {
    return [];
  }

  let options: Option[] = group.solutions.map((solution) => ({
    label: solution.studentPseudonym,
    value: solution.id,
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
  superGroups,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  taskType: TaskType;
  superGroups: AnalyzedSuperGroup[];
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

  const groups = useMemo(
    () => superGroups.flatMap((g) => g.groups),
    [superGroups],
  );

  const groupOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(messages.defaultGroupOption),
        value: defaultGroupValue,
      },
      ...groups.map((g) => ({
        label: g.name,
        value: g.name,
      })),
    ],
    [intl, groups],
  );

  const leftSolution = useMemo(
    () =>
      groups
        .find((g) => g.name === selectedLeftGroup)
        ?.solutions.find((s) => s.id === selectedLeftSolution),
    [groups, selectedLeftGroup, selectedLeftSolution],
  );

  const rightSolution = useMemo(
    () =>
      groups
        .find((g) => g.name === selectedRightGroup)
        ?.solutions.find((s) => s.id === selectedRightSolution),
    [groups, selectedRightGroup, selectedRightSolution],
  );

  useEffect(() => {
    const group = groups.find((g) => g.name === selectedLeftGroup);

    getOptions(authContext, group).then((options) => {
      setLeftSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSolutionValue,
        },
        ...options,
      ]);
    });
  }, [intl, selectedLeftGroup, groups, authContext]);

  useEffect(() => {
    const group = groups.find((g) => g.name === selectedRightGroup);

    getOptions(authContext, group).then((options) => {
      setRightSolutionOptions([
        {
          label: intl.formatMessage(messages.defaultSolutionOption),
          value: defaultSolutionValue,
        },
        ...options,
      ]);
    });
  }, [intl, selectedRightGroup, groups, authContext]);

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

                    setModalSolutionId(leftSolution.id);
                  }}
                  data-testid={`left-edit-button`}
                >
                  <FormattedMessage
                    id="CodeComparison.edit"
                    defaultMessage="Edit"
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
                solutionId={leftSolution.id}
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

                    setModalSolutionId(rightSolution.id);
                  }}
                  data-testid={`right-edit-button`}
                >
                  <FormattedMessage
                    id="CodeComparison.edit"
                    defaultMessage="Edit"
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
                solutionId={rightSolution.id}
              />
            )}
          </Col>
        </Row>
      </CodeComparisonWrapper>
    </>
  );
};

export default CodeComparison;
