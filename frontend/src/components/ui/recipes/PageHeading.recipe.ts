import { defineRecipe } from "@chakra-ui/react";

export const PageHeadingRecipe = defineRecipe({
  variants: {
    variant: {
      title: {
        fontSize: "4xl",
        fontWeight: "semiBold",
        color: "fg",
      },
      description: {
        marginTop: "md",
        fontSize: "2xl",
        fontWeight: "normal",
        color: "pageDescriptionColor",
      },
      subHeading: {
        marginTop: "md",
        fontSize: "3xl",
        fontWeight: "semiBold",
        wordBreak: "keep-all",
        whiteSpace: "nowrap",
        color: "fg",
      },
    },
    size: {
      sm: {
        fontSize: "lg",
      },
      md: {
        fontSize: "xl",
      },
      lg: {
        fontSize: "2xl",
      },
      xl: {
        fontSize: "3xl",
      },
      "2xl": {
        fontSize: "4xl",
      },
    },
    spacing: {
      none: {
        marginTop: "0",
      },
      tight: {
        marginTop: "sm",
      },
      normal: {
        marginTop: "md",
      },
      loose: {
        marginTop: "lg",
      },
      extraLoose: {
        marginTop: "4xl",
      },
    },
  },
  defaultVariants: {
    variant: "title",
  },
});

export const PageHeadingVariant = {
  title: "title",
  description: "description",
  subHeading: "subHeading",
} as const;
