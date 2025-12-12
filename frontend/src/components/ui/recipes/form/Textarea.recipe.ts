import { defineRecipe } from "@chakra-ui/react";

export const TextAreaRecipe = defineRecipe({
  base: {
    padding: "{spacing.sm spacing.md}",
    minHeight: "{lineHeights.md}",
    width: "100%",
  },
});
