import styled from "@emotion/styled";
import {
  filterCriteria,
  FilterCriterion,
  FilterCriterionParameters,
  FilterCriterionType,
} from "./filter";
import CriterionFilterForm from "./filter/CriterionFilterForm";
import { MessageDescriptor, useIntl } from "react-intl";
import { TaskType } from "@/api/collimator/generated/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SetStateAction } from "react";

const Wrapper = styled.div`
  border-top: 1px solid var(--foreground-color);
  padding-top: 1rem;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;

  h4 {
    font-size: 1rem;
    font-weight: bold;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;

    span:last-of-type {
      cursor: pointer;
    }
  }

  & > * {
    width: 100%;

    &:not(:last-child) {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--foreground-color);
      margin-bottom: 1rem;
    }
  }

  margin-bottom: 1rem;
`;

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

const AppliedFilters = ({
  taskType,
  filters,
  setFilters,
  parametersByCriterion,
}: {
  taskType: TaskType;
  filters: FilterCriterion[];
  setFilters: (value: SetStateAction<FilterCriterion[]>) => void;
  parametersByCriterion: {
    [key in FilterCriterionType]?: FilterCriterionParameters;
  };
}) => {
  const intl = useIntl();
  if (filters.length === 0) {
    return null;
  }

  return (
    <Wrapper>
      {filters.map((filter) => {
        const params = parametersByCriterion[filter.criterion];

        if (params === undefined) {
          return null;
        }

        return (
          <div key={filter.criterion}>
            <h4>
              <span>
                {intl.formatMessage(
                  filterNameByCriterion[filter.criterion](taskType),
                )}
              </span>

              <span>
                <FontAwesomeIcon
                  icon={faXmark}
                  onClick={() =>
                    setFilters(filters.filter((f) => f !== filter))
                  }
                />
              </span>
            </h4>
            <CriterionFilterForm
              setFilters={setFilters}
              filter={filter}
              parameters={params}
            />
          </div>
        );
      })}
    </Wrapper>
  );
};

export default AppliedFilters;
