import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
} from "@chakra-ui/react";
import { ButtonRecipe } from "./recipes/buttons/Button.recipe";
import { IconButtonRecipe } from "./recipes/IconButton.recipe";
import { PageHeadingRecipe } from "./recipes/PageHeading.recipe";
import { FieldRecipe, InputRecipe } from "./recipes/form/Input.recipe";
import { CloseButtonRecipe } from "./recipes/buttons/CloseButton.recipe";
import { DropdownMenuRecipe } from "./recipes/DropdownMenu.recipe";
import { BreadcrumbsRecipe } from "./recipes/Breadcrumbs.recipe";
import { TextAreaRecipe } from "./recipes/form/Textarea.recipe";
import { SelectRecipe } from "./recipes/Select.recipe";
import { ContainerRecipe } from "./recipes/Container.recipe";
import { CardRecipe } from "./recipes/Card.recipe";
import { HStackRecipe } from "./recipes/HStack.recipe";
import { ToasterRecipe } from "./recipes/Toaster.recipe";
import { ModalRecipe } from "./recipes/Modal.recipe";
import { TableRecipe } from "./recipes/table/TableRoot.recipe";
import { MenuRecipe } from "./recipes/Menu.recipe";

const config = defineConfig({
  theme: {
    slotRecipes: {
      dropdownMenu: DropdownMenuRecipe,
      breadcrumb: BreadcrumbsRecipe,
      select: SelectRecipe,
      toaster: ToasterRecipe,
      field: FieldRecipe,
      dialog: ModalRecipe,
      card: CardRecipe,
      table: TableRecipe,
      menu: MenuRecipe,
    },
    recipes: {
      button: ButtonRecipe,
      container: ContainerRecipe,
      iconButton: IconButtonRecipe,
      pageHeading: PageHeadingRecipe,
      input: InputRecipe,
      closeButton: CloseButtonRecipe,
      textArea: TextAreaRecipe,
      hstack: HStackRecipe,
    },
    tokens: defineTokens({
      colors: {
        dark: { value: "var(--accent-color)" },
        neutral: { value: "var(--neutral-color)" },
        success: { value: "var(--success-color)" },
        error: { value: "var(--error-color)" },
      },
      spacing: {
        xs: { value: "0.25rem" },
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "1.5rem" },
        xl: { value: "2rem" },
        "4xl": { value: "5rem" },
      },
      padding: {
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "1.5rem" },
      },
      inputWidths: {
        md: { value: "30rem" },
      },
      borders: {
        thin: { value: "1px solid" },
      },
      fontSizes: {
        sm: { value: "0.875rem" },
        md: { value: "1rem" },
        lg: { value: "1.125rem" },
        xl: { value: "1.25rem" },
        "2xl": { value: "1.5rem" },
        "3xl": { value: "1.875rem" },
        "4xl": { value: "2.25rem" },
      },
      lineHeights: {
        md: { value: "10rem" },
      },
      fontWeights: {
        semiBold: { value: "600" },
      },
      radii: {
        sm: { value: "0.25rem" },
      },
      fonts: {
        body: { value: "Inter, Helvetica, sans-serif" },
      },
    }),
    semanticTokens: defineTokens({
      colors: {
        buttonBg: { value: "{colors.dark}" },
        buttonFg: { value: "{colors.white}" },
        buttonDangerBg: { value: "{colors.error}" },
        buttonDangerFg: { value: "{colors.white}" },
        errorColor: { value: "{colors.error}" },
      },
    }),
  },
  globalCss: {
    "html, body": {
      maxWidth: "100vw",
      overflowX: "hidden",
    },
    body: {
      color: "var(--chakra-colors-fg)",
      backgroundColor: "var(--chakra-colors-bg)",
      fontFamily: "Inter, sans-serif",
    },
    ".p-tooltip": {
      backgroundColor: "var(--chakra-colors-bg)",
      color: "var(--chakra-colors-fg)",
      border: "1px solid var(--chakra-colors-fg)",
      borderRadius: "var(--chakra-radii-sm)",
      padding: "1rem",
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
