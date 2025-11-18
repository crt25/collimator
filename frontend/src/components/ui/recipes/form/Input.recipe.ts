import { defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

export const InputRecipe = defineRecipe({
  base: {
    width: "100%",
    maxWidth: "100%",
    padding: "sm",
    borderRadius: "sm",
    borderWidth: "thin",
    _invalid: {
      borderColor: "error",
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "inputBg !important",
        _placeholder: {
          color: "inputPlaceHolderColor",
        },
      },
      buttonForm: {
        padding: "{space.sm space.md}",
        backgroundColor: "buttonBg",
        color: "buttonFg",
        _disabled: {
          backgroundColor: "buttonDisabledBg",
        },
        _hover: {
          backgroundColor: "accent !important",
          opacity: 0.8,
        },
      },
      inputForm: {
        backgroundColor: "inputFormBg !important",
        _placeholder: {
          color: "inputPlaceHolderColor",
        },
      },
    },
  },
});

export const FieldRecipe = defineSlotRecipe({
  slots: ["label"],
  base: {
    label: {
      fontSize: "sm",
      fontWeight: "semibold",
      marginBottom: "xs",
      display: "block",
    },
  },
});
