import styled from "@emotion/styled";

const colorCount = 8;

/**
 * Deterministically get a color for an id.
 */
const getColor = (id: string | number) => {
  if (typeof id === "number") {
    return id % colorCount;
  }

  // compute some deterministic number from the string id
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }

  return sum % colorCount;
};

const TagWrapper = styled.span`
  color: var(--background-color);
  background-color: var(--foreground-color);
  border-radius: var(--border-radius);

  padding: 0.5rem 1rem;

  &.color-0 {
    background-color: #333;
  }

  &.color-1 {
    background-color: #444;
  }

  &.color-2 {
    background-color: #555;
  }

  &.color-3 {
    background-color: #666;
  }

  &.color-4 {
    background-color: #777;
  }

  &.color-5 {
    background-color: #888;
  }

  &.color-6 {
    background-color: #999;
  }

  &.color-7 {
    background-color: #aaa;
  }
`;

const Tag = ({
  id,
  children,
}: {
  id: string | number;
  children: React.ReactNode;
}) => {
  const color = getColor(id);
  return <TagWrapper className={`color-${color}`}>{children}</TagWrapper>;
};

export default Tag;
