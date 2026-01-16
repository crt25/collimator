import { defineSlotRecipe } from "@chakra-ui/react";
import { breadcrumbAnatomy } from "@chakra-ui/react/anatomy";

export const BreadcrumbsRecipe = defineSlotRecipe({
  slots: breadcrumbAnatomy.keys(),
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
      fontWeight: "semiBold",
      color: "fgTertiary",
      _hover: {
        textDecoration: "underline",
      },
    },
    separator: {
      fontSize: "sm !important",
      marginLeft: "sm",
      marginRight: "sm",
      color: "fgTertiary",
    },
  },
});
