import styled from "@emotion/styled";
import { Col, Row } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Select from "../form/Select";
import { useState } from "react";
import { SessionTask } from "@/api/collimator/models/sessions/session-task";
import AnalyzerFilterForm from "./filter/AnalyzerFilterForm";
import { AstFilter } from "./filter";
import AnalyzerGroupForm from "./group/AnalyzerGroupForm";
import { AstGroup } from "./group";

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

const Analyzer = ({ tasks }: { tasks: SessionTask[] }) => {
  const [selectedTask, setSelectedTask] = useState<number | undefined>(
    tasks[0]?.id,
  );

  const [filters, setFilters] = useState<AstFilter[]>([]);
  const [groups, setGroups] = useState<AstGroup[]>([]);

  if (!selectedTask) {
    return (
      <FormattedMessage
        id="Analyzer.noTasksInSession"
        defaultMessage="There are no tasks in this session."
      />
    );
  }

  return (
    <Row>
      <Col xs={3}>
        <Parameters>
          <Select
            label={messages.taskSelection}
            options={tasks.map((task) => ({
              label: task.title,
              value: task.id,
            }))}
            data-testid="select-task"
            onChange={(e) => setSelectedTask(parseInt(e.target.value))}
            value={selectedTask}
            alwaysShow
          />

          <AnalyzerFilterForm filters={filters} setFilters={setFilters} />
          <AnalyzerGroupForm groups={groups} setGroups={setGroups} />
        </Parameters>
      </Col>
      <Col xs={9}>dd</Col>
    </Row>
  );
};

export default Analyzer;
