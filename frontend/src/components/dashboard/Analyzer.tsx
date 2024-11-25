import styled from "@emotion/styled";
import { Col, Row } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Select from "../form/Select";
import { useState } from "react";
import AnalyzerFilterForm from "./filter/AnalyzerFilterForm";
import { AstFilter } from "./filter";
import AnalyzerGroupForm from "./group/AnalyzerGroupForm";
import { AstGroup } from "./group";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import Analysis from "./Analysis";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import SwrContent from "../SwrContent";

const Parameters = styled.div`
  padding: 1rem;
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);

  select {
    width: 100%;
  }
`;

const messages = defineMessages({
  taskSelection: {
    id: "Analyzer.parameters.taskSelection",
    defaultMessage: "Task Selection",
  },
  addFilter: {
    id: "Analyzer.parameters.addFilter",
    defaultMessage: "Add Filter",
  },
});

const Analyzer = ({ session }: { session: ExistingSessionExtended }) => {
  const [selectedTask, setSelectedTask] = useState<number | undefined>(
    session.tasks[0]?.id,
  );

  const [filters, setFilters] = useState<AstFilter[]>([]);
  const [groups, setGroups] = useState<AstGroup[]>([]);

  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useTask(selectedTask);

  if (!selectedTask) {
    return (
      <FormattedMessage
        id="Analyzer.noTasksInSession"
        defaultMessage="There are no tasks in this session."
      />
    );
  }

  return (
    <SwrContent data={task} isLoading={isLoadingTask} error={taskError}>
      {(task) => (
        <Row>
          <Col xs={3}>
            <Parameters>
              <Select
                label={messages.taskSelection}
                options={session.tasks.map((task) => ({
                  label: task.title,
                  value: task.id,
                }))}
                data-testid="select-task"
                onChange={(e) => setSelectedTask(parseInt(e.target.value))}
                value={selectedTask}
                alwaysShow
              />

              <AnalyzerFilterForm
                taskType={task.type}
                filters={filters}
                setFilters={setFilters}
              />

              <AnalyzerGroupForm
                taskType={task.type}
                groups={groups}
                setGroups={setGroups}
              />
            </Parameters>
          </Col>
          <Col xs={9}>
            {selectedTask && (
              <Analysis
                session={session}
                taskId={selectedTask}
                filters={filters}
                groups={groups}
              />
            )}
          </Col>
        </Row>
      )}
    </SwrContent>
  );
};

export default Analyzer;
