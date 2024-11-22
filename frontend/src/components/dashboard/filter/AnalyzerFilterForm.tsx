import styled from "@emotion/styled";
import Select from "../../form/Select";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useCallback, useState } from "react";
import {
  allFilters,
  AstFilter,
  FilterCriterionType,
  filterNameByCriterion,
} from ".";
import AnalyzerTags from "../AnalyzerTags";
import CriterionFilterForm from "./CriterionFilterForm";
import { CriteronType } from "../criteria/criterion-type";

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

const FilterCriterion = ({ criterion }: { criterion: AstFilter }) => {
  const intl = useIntl();

  return intl.formatMessage(filterNameByCriterion[criterion.criterion]);
};

const AnalyzerFilterForm = ({
  filters,
  setFilters,
}: {
  filters: AstFilter[];
  setFilters: (filters: AstFilter[]) => void;
}) => {
  const [filterToEdit, setFilterToEdit] = useState<FilterCriterionType>(
    CriteronType.none,
  );

  const [currentFilter, setCurrentFilter] = useState<AstFilter | undefined>(
    undefined,
  );

  const onEdit = useCallback((criterion: AstFilter) => {
    setFilterToEdit(criterion.criterion);
    setCurrentFilter(criterion);
  }, []);

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
            setFilterToEdit(CriteronType.none);
            setCurrentFilter(undefined);
          }
        }}
        active={currentFilter}
        onEdit={onEdit}
        RenderTag={FilterCriterion}
      />

      <Select
        options={allFilters}
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
            setFilterToEdit(CriteronType.none);
          },
        }}
      />
    </>
  );
};

export default AnalyzerFilterForm;
