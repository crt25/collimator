import styled from "@emotion/styled";
import Select from "../../form/Select";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import { useCallback, useMemo, useState } from "react";
import AnalyzerTags from "../AnalyzerTags";
import { AstGroup, GroupCriterionType, groupCriteria } from ".";
import CriterionGroupForm from "./CriterionGroupForm";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { TaskType } from "@/api/collimator/generated/models";

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
`;

const messages = defineMessages({
  addGroup: {
    id: "AnalyzerGroupForm.addGroup",
    defaultMessage: "Add group",
  },

  updateGroup: {
    id: "AnalyzerGroupForm.updateGroup",
    defaultMessage: "Update group",
  },
});

export const groupNameByCriterion = groupCriteria.reduce(
  (acc, criterion) => {
    acc[criterion.criterion] = (taskType: TaskType): MessageDescriptor =>
      criterion.messages(taskType).name;

    return acc;
  },
  {} as {
    [key in GroupCriterionType]: (taskType: TaskType) => MessageDescriptor;
  },
);

const GroupCriterion = ({
  taskType,
  criterion,
}: {
  taskType: TaskType;
  criterion: AstGroup;
}) => {
  const intl = useIntl();

  return intl.formatMessage(
    groupNameByCriterion[criterion.criterion](taskType),
  );
};

const AnalyzerGroupForm = ({
  taskType,
  groups,
  setGroups,
}: {
  taskType: TaskType;
  groups: AstGroup[];
  setGroups: (groups: AstGroup[]) => void;
}) => {
  const [groupToEdit, setGroupToEdit] = useState<GroupCriterionType>(
    CriterionType.none,
  );

  const [currentGroup, setCurrentGroup] = useState<AstGroup | undefined>(
    undefined,
  );

  const onEdit = useCallback((criterion: AstGroup) => {
    setGroupToEdit(criterion.criterion);
    setCurrentGroup(criterion);
  }, []);

  const groupOptions = useMemo(
    () =>
      groupCriteria.map((c) => ({
        value: c.criterion,
        label: c.messages(taskType).name,
      })),
    [taskType],
  );

  return (
    <>
      <Label>
        <FormattedMessage
          id="AnalyzerGroupForm.groupingCriteria"
          defaultMessage="Grouping Criteria"
        />
      </Label>

      <AnalyzerTags
        tags={groups}
        onDelete={(group) => {
          setGroups(groups.filter((f) => f !== group));

          if (currentGroup === group) {
            setGroupToEdit(CriterionType.none);
            setCurrentGroup(undefined);
          }
        }}
        active={currentGroup}
        onEdit={onEdit}
      >
        {(criterion) => (
          <GroupCriterion taskType={taskType} criterion={criterion} />
        )}
      </AnalyzerTags>

      <Select
        options={groupOptions}
        data-testid="add-group"
        onChange={(e) => {
          const type = e.target.value as GroupCriterionType;

          setGroupToEdit(type);
          setCurrentGroup(undefined);
        }}
        value={groupToEdit}
        alwaysShow
      />

      <CriterionGroupForm
        criterion={groupToEdit}
        props={{
          submitMessage: currentGroup
            ? messages.updateGroup
            : messages.addGroup,
          initialValues: currentGroup ? currentGroup : {},
          onUpdate: (newFilter: AstGroup) => {
            setGroups([...groups.filter((f) => f !== currentGroup), newFilter]);
            setCurrentGroup(undefined);
            setGroupToEdit(CriterionType.none);
          },
        }}
      />
    </>
  );
};

export default AnalyzerGroupForm;
