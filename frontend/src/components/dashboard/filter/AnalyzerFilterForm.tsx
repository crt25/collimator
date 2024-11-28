import styled from "@emotion/styled";
import Select from "../../form/Select";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import { useCallback, useMemo, useState } from "react";
import { FilterCriterion, FilterCriterionType, filterCriteria } from ".";
import AnalyzerTags from "../AnalyzerTags";
import CriterionFilterForm from "./CriterionFilterForm";
import { TaskType } from "@/api/collimator/generated/models";
import { MetaCriterionType } from "../criteria/meta-criterion-type";

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

const FilterCriterionEntry = ({
  taskType,
  criterion,
}: {
  taskType: TaskType;
  criterion: FilterCriterion;
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
  filters: FilterCriterion[];
  setFilters: (filters: FilterCriterion[]) => void;
}) => {
  const [filterToEdit, setFilterToEdit] = useState<FilterCriterionType>(
    MetaCriterionType.none,
  );

  const [currentFilter, setCurrentFilter] = useState<
    FilterCriterion | undefined
  >(undefined);

  const onEdit = useCallback((criterion: FilterCriterion) => {
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
            setFilterToEdit(MetaCriterionType.none);
            setCurrentFilter(undefined);
          }
        }}
        active={currentFilter}
        onEdit={onEdit}
      >
        {(criterion) => (
          <FilterCriterionEntry taskType={taskType} criterion={criterion} />
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
          onUpdate: (newFilter: FilterCriterion) => {
            setFilters([
              ...filters.filter((f) => f !== currentFilter),
              newFilter,
            ]);
            setCurrentFilter(undefined);
            setFilterToEdit(MetaCriterionType.none);
          },
        }}
      />
    </>
  );
};

export default AnalyzerFilterForm;
