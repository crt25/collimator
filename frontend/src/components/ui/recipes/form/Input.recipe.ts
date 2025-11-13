import { defineRecipe } from "@chakra-ui/react";

export const InputRecipe = defineRecipe({
  base: {
    width: "100%",
    maxWidth: "100%",
    padding: "sm",
    borderRadius: "sm",
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
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export const InputVariant = {
  primary: "primary",
  inputForm: "inputForm",
  buttonForm: "buttonForm",
} as const;

export type InputVariant = keyof NonNullable<
  (typeof InputRecipe)["variants"]
>["variant"];
