import { defineSlotRecipe } from "@chakra-ui/react";
import { tableAnatomy } from "@chakra-ui/react/anatomy";

export const TableRecipe = defineSlotRecipe({
  slots: tableAnatomy.keys(),
  base: {
    root: { tableLayout: "fixed" },
    header: {
      backgroundColor: "gray.200",
    },
    columnHeader: {
      fontWeight: "semibold",
    },
    cell: {
      borderBottomWidth: "thin !important",
    },
  },
  variants: {
    interactive: {
      true: {
        row: {
          _hover: {
            cursor: "pointer",
          },
        },
      },
    },
  },
});
