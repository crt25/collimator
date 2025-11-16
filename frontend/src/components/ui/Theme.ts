import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
} from "@chakra-ui/react";
import { ButtonRecipe } from "./recipes/buttons/Button.recipe";
import { IconButtonRecipe } from "./recipes/IconButton.recipe";
import { PageHeadingRecipe } from "./recipes/PageHeading.recipe";
import { InputRecipe } from "./recipes/form/Input.recipe";
import { CloseButtonRecipe } from "./recipes/buttons/CloseButton.recipe";
import { DropdownMenuRecipe } from "./recipes/DropdownMenu.recipe";
import { BreadcrumbsRecipe } from "./recipes/Breadcrumbs.recipe";
import { TextAreaRecipe } from "./recipes/form/Textarea.recipe";
import { hstackRecipe } from "./recipes/HStack.recipe";
import { SelectRecipe } from "./recipes/Select.recipe";

const config = defineConfig({
  theme: {
    slotRecipes: {
      dropdownMenu: DropdownMenuRecipe,
      breadcrumb: BreadcrumbsRecipe,
      select: SelectRecipe,
    },
    recipes: {
      button: ButtonRecipe,
      iconButton: IconButtonRecipe,
      pageHeading: PageHeadingRecipe,
      input: InputRecipe,
      closeButton: CloseButtonRecipe,
      textArea: TextAreaRecipe,
      hstack: hstackRecipe,
    },
    tokens: defineTokens({
      colors: {
        white: { value: "var(--background-color)" },
        black: { value: "var(--foreground-color)" },
        gray: {
          50: { value: "var(--background-color-secondary)" },
          100: { value: "var(--border-color-secondary)" },
          200: { value: "var(--border-color-tertiary)" },
          600: { value: "var(--button-disabled-background-color)" },
          1000: { value: "var(--foreground-color-tertiary)" },
        },
        dark: { value: "var(--accent-color)" },
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
      zIndex: {
        // view here for more detail about xIndex token values: https://chakra-ui.com/docs/theming/z-index
        overlay: { value: "1300" },
      },
    }),
    semanticTokens: defineTokens({
      colors: {
        bg: { value: "{colors.white}" },
        bgSecondary: { value: "{colors.gray.50}" },
        fg: { value: "{colors.black}" },
        fgSecondary: { value: "{colors.black}" },
        fgTertiary: { value: "{colors.gray.1000}" },
        accent: { value: "{colors.dark}" },
        accentHighlight: { value: "{colors.dark}" },
        border: { value: "{colors.gray.200}" },
        borderDark: { value: "{colors.black}" },
        buttonBg: { value: "{colors.dark}" },
        buttonFg: { value: "{colors.white}" },
        buttonSecondaryBg: { value: "{colors.white}" },
        buttonSecondaryFg: { value: "{colors.black}" },
        buttonSecondaryBorder: { value: "{colors.gray.200}" },
        buttonDangerBg: { value: "{colors.error}" },
        buttonDangerFg: { value: "{colors.white}" },
        inputBg: { value: "var(--input-background-color)" },
        selectBg: { value: "var(--select-background-color)" },
        buttonDisabledBg: { value: "{colors.gray.600}" },
        iconButtonBackgroundColor: {
          value: "var(--icon-button-background-color)",
        },
        headerBg: { value: "{colors.white}" },
        headerBorder: { value: "{colors.black}" },
        headerFg: { value: "{colors.neutral}" },
        pageDescriptionColor: { value: "{colors.black}" },
        inputColor: { value: "{colors.neutral}" },
        inputFormBg: { value: "var(--input-form-background-color)" },
        inputPlaceholderColor: { value: "{colors.gray.100}" },
        errorColor: { value: "{colors.error}" },
        buttonBackgroundColor: { value: "{colors.dark}" },
        buttonSecondaryBorderColor: { value: "{colors.gray.200}" },
      },
      zIndex: {
        overlay: { value: "{zIndex.overlay}" },
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
    a: {
      color: "inherit !important",
      textDecoration: "none !important",
      _hover: {
        textDecoration: "underline !important",
      },
    },
    ".p-tooltip": {
      backgroundColor: "var(--chakra-colors-bg)",
      color: "var(--chakra-colors-fg)",
      border: "1px solid var(--chakra-colors-fg)",
      borderRadius: "var(--chakra-radii-sm)",
      padding: "1rem",
    },
    ".modal": {
      // set the z-index to the same value s.t. we can stack modals (although this is not recommended)
      "--bs-backdrop-zindex": "1050",
      "--bs-modal-zindex": "1050",
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
