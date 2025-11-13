import { defineRecipe } from "@chakra-ui/react";

export const FormContainerRecipe = defineRecipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "md",
    marginTop: "4xl",
  },
});

export default FormContainerRecipe;
