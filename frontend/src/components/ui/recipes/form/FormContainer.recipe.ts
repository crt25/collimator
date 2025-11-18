import { defineRecipe } from "@chakra-ui/react";

export const FormContainerRecipe = defineRecipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "md",
    padding: "0",
  },
});

export default FormContainerRecipe;
