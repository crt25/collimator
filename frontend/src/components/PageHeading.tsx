import { Box, chakra, HStack } from "@chakra-ui/react";
import { PageHeadingRecipe } from "./ui/recipes/layout/PageHeading.recipe";

const StyledPageHeading = chakra("p", PageHeadingRecipe);

const PageHeading = ({
  variant,
  actions,
  description,
  children,
  testId,
  clamp = true,
}: {
  variant?: React.ComponentProps<typeof StyledPageHeading>["variant"];
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
  // Truncate the title to one line and the description to two lines with an
  // ellipsis so overly long values don't break the layout. On by
  // default; pass clamp={false} for student-facing headings that should show
  // their title/description in full.
  clamp?: boolean;
}) => {
  const heading = (
    <Box
      marginTop="lg"
      marginBottom="lg"
      minWidth={clamp ? 0 : undefined}
      flex={clamp && actions ? 1 : undefined}
    >
      {description ? (
        <>
          <StyledPageHeading
            variant={variant}
            marginBottom="md"
            data-testid={testId}
            lineClamp={clamp ? 1 : undefined}
          >
            {children}
          </StyledPageHeading>
          <StyledPageHeading
            variant="description"
            lineClamp={clamp ? 2 : undefined}
          >
            {description}
          </StyledPageHeading>
        </>
      ) : (
        <StyledPageHeading
          variant={variant}
          data-testid={testId}
          lineClamp={clamp ? 1 : undefined}
        >
          {children}
        </StyledPageHeading>
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
