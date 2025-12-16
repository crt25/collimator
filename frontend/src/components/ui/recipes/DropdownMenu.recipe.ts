import { defineSlotRecipe } from "@chakra-ui/react";

export const DropdownMenuRecipe = defineSlotRecipe({
  slots: ["trigger", "content"],
  base: {
    trigger: {
      borderWidth: "thin",
      borderStyle: "solid",
      borderRadius: "sm !important",
      borderColor: "gray.200",
      padding: "md",
      fontWeight: "semibold",
    },
    content: {
      backgroundColor: "bg",
      borderColor: "headerBorder",
      cursor: "pointer",
    },
  },
  variants: {
    variant: {
      primary: {},
      secondary: {
        trigger: {
          color: "fgSecondary",
          backgroundColor: "buttonBg !important",
          borderColor: "black",
        },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});
