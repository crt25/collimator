import { defineSlotRecipe } from "@chakra-ui/react";
import { emptyStateAnatomy } from "@chakra-ui/react/anatomy";

export const EmptyStateRecipe = defineSlotRecipe({
  slots: emptyStateAnatomy.keys(),
  base: {
    title: {
      fontWeight: "normal",
    },
  },
});
