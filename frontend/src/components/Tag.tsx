import styled from "@emotion/styled";

const getColor = (id: string | number) => {
  let sum = 0;

  if (typeof id === "number") {
    sum = id;
  } else {
    // compute some deterministic number of the id

    //iterate over the string and get the sum of the char codes

    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
  }

  // now mod it by the number of colors
  return sum % 8;
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
