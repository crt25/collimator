import { chakra, HStack } from "@chakra-ui/react";
import { ComponentProps } from "react";
import { PageHeadingRecipe } from "./ui/recipes/PageHeading.recipe";

const StyledPageHeading = chakra("p", PageHeadingRecipe);

const PageHeading = ({
  actions,
  ...props
}: ComponentProps<typeof StyledPageHeading> & {
  actions?: React.ReactNode;
}) => {
  if (actions) {
    return (
      <div>
        <HStack justifyContent="space-between">
          <StyledPageHeading {...props} />
          <div>{actions}</div>
        </HStack>
      </div>
    );
  }

  return <StyledPageHeading {...props} />;
};

export default PageHeading;
