import { chakra } from "@chakra-ui/react";
import {
  PageHeadingRecipe,
  PageHeadingVariant,
} from "./ui/recipes/PageHeading.recipe";

const PageHeading = chakra("p", PageHeadingRecipe);

export { PageHeadingVariant };
export default PageHeading;
