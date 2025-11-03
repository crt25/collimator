import { Tag as ChakraTag } from "@chakra-ui/react";

const colorPalettes = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "cyan",
];

/**
 * Deterministically get a color for an id.
 */
const getColorPalette = (id: string | number) => {
  if (typeof id === "number") {
    return colorPalettes[id % colorPalettes.length];
  }

  // compute some deterministic number from the string id
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }

  return colorPalettes[sum % colorPalettes.length];
};

const Tag = ({
  id,
  children,
}: {
  id: string | number;
  children: React.ReactNode;
}) => {
  const colorScheme = getColorPalette(id);

  return (
    <ChakraTag.Root colorPalette={colorScheme} variant="solid">
      <ChakraTag.Label>{children}</ChakraTag.Label>
    </ChakraTag.Root>
  );
};

export default Tag;
