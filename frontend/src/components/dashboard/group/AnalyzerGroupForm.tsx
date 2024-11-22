import styled from "@emotion/styled";
import Select from "../../form/Select";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useCallback, useState } from "react";
import AnalyzerTags from "../AnalyzerTags";
import {
  allGroups,
  AstGroup,
  GroupCriterionType,
  groupNameByCriterion,
} from ".";
import CriterionGroupForm from "./CriterionGroupForm";
import { CriterionType } from "@/data-analyzer/analyze-asts";

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

const GroupCriterion = ({ criterion }: { criterion: AstGroup }) => {
  const intl = useIntl();

  return intl.formatMessage(groupNameByCriterion[criterion.criterion]);
};

const AnalyzerGroupForm = ({
  groups,
  setGroups,
}: {
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
        RenderTag={GroupCriterion}
      />

      <Select
        options={allGroups}
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