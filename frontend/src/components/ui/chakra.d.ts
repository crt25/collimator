import { ButtonVariant } from "@/components/ui/recipes/buttons/Button.recipe";

declare module "@chakra-ui/react" {
  // Chakra's type system does not recognize custom variant types defined via recipes and theming system.
  // We need to override the component props to include our custom variants.
  interface ButtonProps {
    variant?: ButtonVariant;
  }
}
