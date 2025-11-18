import { defineSlotRecipe } from "@chakra-ui/react";
import { selectAnatomy } from "@chakra-ui/react/anatomy";

export const SelectRecipe = defineSlotRecipe({
  slots: selectAnatomy.keys(),
  base: {
    label: {
      fontWeight: "semibold",
    },
  },
});
