import { Box, chakra, HStack } from "@chakra-ui/react";
import { PageHeadingRecipe } from "./ui/recipes/PageHeading.recipe";

const StyledPageHeading = chakra("p", PageHeadingRecipe);

const PageHeading = ({
  variant,
  actions,
  description,
  children,
}: {
  variant?: React.ComponentProps<typeof StyledPageHeading>["variant"];
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const heading = (
    <Box marginTop="lg" marginBottom="lg">
      {description ? (
        <>
          <StyledPageHeading variant={variant} marginBottom="md">
            {children}
          </StyledPageHeading>
          <StyledPageHeading variant="description">
            {description}
          </StyledPageHeading>
        </>
      ) : (
        <StyledPageHeading variant={variant}>{children}</StyledPageHeading>
      )}
    </Box>
  );

  if (actions) {
    return (
      <HStack justifyContent="space-between">
        {heading}
        <div>{actions}</div>
      </HStack>
    );
  }

  return heading;
};

export default PageHeading;
