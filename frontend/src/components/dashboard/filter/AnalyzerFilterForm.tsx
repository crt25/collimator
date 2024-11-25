import styled from "@emotion/styled";
import Select from "../../form/Select";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import { useCallback, useMemo, useState } from "react";
import { AstFilter, FilterCriterionType, filterCriteria } from ".";
import AnalyzerTags from "../AnalyzerTags";
import CriterionFilterForm from "./CriterionFilterForm";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { TaskType } from "@/api/collimator/generated/models";

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
`;

const messages = defineMessages({
  addFilter: {
    id: "AnalyzerFilterForm.addFilter",
    defaultMessage: "Add filter",
  },

  updateFilter: {
    id: "AnalyzerFilterForm.updateFilter",
    defaultMessage: "Update filter",
  },
});

const filterNameByCriterion = filterCriteria.reduce(
  (acc, criterion) => {
    acc[criterion.criterion] = (taskType: TaskType): MessageDescriptor =>
      criterion.messages(taskType).name;

    return acc;
  },
  {} as {
    [key in FilterCriterionType]: (taskType: TaskType) => MessageDescriptor;
  },
);

const FilterCriterion = ({
  taskType,
  criterion,
}: {
  taskType: TaskType;
  criterion: AstFilter;
}) => {
  const intl = useIntl();

  return intl.formatMessage(
    filterNameByCriterion[criterion.criterion](taskType),
  );
};

const AnalyzerFilterForm = ({
  taskType,
  filters,
  setFilters,
}: {
  taskType: TaskType;
  filters: AstFilter[];
  setFilters: (filters: AstFilter[]) => void;
}) => {
  const [filterToEdit, setFilterToEdit] = useState<FilterCriterionType>(
    CriterionType.none,
  );

  const [currentFilter, setCurrentFilter] = useState<AstFilter | undefined>(
    undefined,
  );

  const onEdit = useCallback((criterion: AstFilter) => {
    setFilterToEdit(criterion.criterion);
    setCurrentFilter(criterion);
  }, []);

  const filterOptions = useMemo(
    () =>
      filterCriteria.map((c) => ({
        value: c.criterion,
        label: c.messages(taskType).name,
      })),
    [taskType],
  );

  return (
    <>
      <Label>
        <FormattedMessage
          id="AnalyzerFilterForm.filterCriteria"
          defaultMessage="Filtering Criteria"
        />
      </Label>

      <AnalyzerTags
        tags={filters}
        onDelete={(filter) => {
          setFilters(filters.filter((f) => f !== filter));

          if (currentFilter === filter) {
            setFilterToEdit(CriterionType.none);
            setCurrentFilter(undefined);
          }
        }}
        active={currentFilter}
        onEdit={onEdit}
      >
        {(criterion) => (
          <FilterCriterion taskType={taskType} criterion={criterion} />
        )}
      </AnalyzerTags>

      <Select
        options={filterOptions}
        data-testid="add-filter"
        onChange={(e) => {
          const type = e.target.value as FilterCriterionType;

          setFilterToEdit(type);
          setCurrentFilter(undefined);
        }}
        value={filterToEdit}
        alwaysShow
      />

      <CriterionFilterForm
        criterion={filterToEdit}
        props={{
          submitMessage: currentFilter
            ? messages.updateFilter
            : messages.addFilter,
          initialValues: currentFilter ? currentFilter : {},
          onUpdate: (newFilter: AstFilter) => {
            setFilters([
              ...filters.filter((f) => f !== currentFilter),
              newFilter,
            ]);
            setCurrentFilter(undefined);
            setFilterToEdit(CriterionType.none);
          },
        }}
      />
    </>
  );
};

export default AnalyzerFilterForm;
