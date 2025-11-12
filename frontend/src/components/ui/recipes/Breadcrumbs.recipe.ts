import { defineSlotRecipe } from "@chakra-ui/react";
export const BreadcrumbsRecipe = defineSlotRecipe({
  slots: ["root", "list", "item", "link", "separator"],
  base: {
    root: {
      padding: "sm",
      fontWeight: "semiBold",
      marginBottom: "md",
    },
    list: {
      gap: "md",
      margin: "0 !important",
      padding: "0 !important",
      color: "fgTertiary",
    },
    item: {
      fontWeight: "semiBold",
    },
    link: {
      fontSize: "lg !important",
      fontWeight: "semiBold",
      color: "fgTertiary",
      _hover: {
        textDecoration: "underline",
      },
    },
    separator: {
      fontSize: "sm !important",
      margin: "0 sm",
      color: "fgTertiary",
    },
  },
});
