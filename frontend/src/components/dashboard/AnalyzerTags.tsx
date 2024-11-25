import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;

  margin-bottom: 1rem;
`;

const Tag = styled.div<{
  active?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  padding: 0.25rem 0.5rem;

  background-color: var(--background-color-secondary);
  border: ${({ active }) => (active ? "#000 1px solid" : "none")};
  border-radius: 0.5rem;

  cursor: pointer;

  button {
    background: none;
    border: none;
    cursor: pointer;
  }
`;

const AnalyzerTags = <T extends unknown>({
  tags,
  onEdit,
  onDelete,
  active,
  children,
}: {
  tags: T[];
  onEdit: (criterion: T) => void;
  onDelete: (criterion: T) => void;
  active?: T;
  children: (criterion: T) => React.ReactNode;
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <Wrapper>
      {tags.map((criterion, index) => (
        <Tag
          key={index}
          active={active === criterion}
          onClick={() => onEdit(criterion)}
        >
          <div>{children(criterion)}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(criterion);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </Tag>
      ))}
    </Wrapper>
  );
};

export default AnalyzerTags;
