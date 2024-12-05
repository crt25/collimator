import styled from "@emotion/styled";
import Select from "../../form/Select";
import { FormattedMessage } from "react-intl";
import { SetStateAction, useMemo } from "react";
import {
  FilterCriterion,
  FilterCriterionType,
  filterCriteria,
  getInitialFilterValues,
} from ".";
import AppliedFilters from "../AppliedFilters";
import { TaskType } from "@/api/collimator/generated/models";
import { MetaCriterionType } from "../criteria/meta-criterion-type";

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
`;

const AnalyzerFilterForm = ({
  taskType,
  filters,
  setFilters,
}: {
  taskType: TaskType;
  filters: FilterCriterion[];
  setFilters: (value: SetStateAction<FilterCriterion[]>) => void;
}) => {
  const filterOptions = useMemo(() => {
    const usedCriteria = new Set(filters.map((f) => f.criterion));

    return filterCriteria
      .filter((c) => !usedCriteria.has(c.criterion))
      .map((c) => ({
        value: c.criterion,
        label: c.messages(taskType).name,
      }));
  }, [filters, taskType]);

  return (
    <>
      <Label>
        <FormattedMessage
          id="AnalyzerFilterForm.filterCriteria"
          defaultMessage="Filtering Criteria"
        />
      </Label>

      <Select
        options={filterOptions}
        data-testid="add-filter"
        onChange={(e) => {
          const type = e.target.value as FilterCriterionType;

          setFilters([...filters, getInitialFilterValues(type)]);
        }}
        value={MetaCriterionType.none}
        alwaysShow
      />

      <AppliedFilters
        taskType={taskType}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

export default AnalyzerFilterForm;