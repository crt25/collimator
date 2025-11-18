import { defineRecipe } from "@chakra-ui/react";

export const FormGridRecipe = defineRecipe({
  base: {
    gridTemplateColumns: "1fr 1fr",
    gap: "md",
    alignItems: "flex-start",
  },
});

export default FormGridRecipe;
