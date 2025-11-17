import { InputVariant } from "@/components/ui/recipes/form/Input.recipe";
import { CardVariant } from "@/components/ui/recipes/Card.recipe";

declare module "@chakra-ui/react" {
  // Chakra's type system does not recognize custom variant types defined via recipes and theming system.
  // We need to override the component props to include our custom variants.

  interface InputProps {
    variant?: InputVariant;
  }

  interface CardRootProps {
    variant?: CardVariant;
  }
}
