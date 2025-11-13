import { defineRecipe } from "@chakra-ui/react";

export const InputRecipe = defineRecipe({
  base: {
    borderWidth: "thin",
  },
  variants: {
    variant: {
      primary: {
        width: "100%",
        maxWidth: "100%",
        padding: "sm",
        _placeholder: {
          color: "inputPlaceHolderColor",
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
