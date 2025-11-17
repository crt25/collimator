import { defineSlotRecipe } from "@chakra-ui/react";

export const CardRecipe = defineSlotRecipe({
  slots: ["root"],
  base: {
    root: {
      borderRadius: "sm",
      padding: "lg",
      backgroundColor: "bg",
      borderWidth: "thin",
      borderStyle: "solid",
      borderColor: "border",
      cursor: "pointer",
      _hover: {
        opacity: 0.8,
      },
    },
  },
  variants: {
    variant: {
      full: {
        root: {
          width: "100%",
          maxWidth: "100%",
        },
      },
      large: {
        root: {
          width: "75%",
          maxWidth: "75%",
        },
      },
      medium: {
        root: {
          width: "50%",
          maxWidth: "50%",
        },
      },
      small: {
        root: {
          width: "35%",
          maxWidth: "35%",
        },
      },
      compact: {
        root: {
          width: "20%",
          maxWidth: "20%",
        },
      },
    },
  },
  defaultVariants: {
    variant: "large",
  },
});

export default CardRecipe;
