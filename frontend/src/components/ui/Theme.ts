import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
} from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: defineTokens({
      colors: {
        white: { value: "#ffffff" },
        black: { value: "#000000" },
        gray: {
          50: { value: "#ddd" },
          200: { value: "#E4E4E7" },
          600: { value: "#999999" },
        },
        neutral: { value: "#171717" },
        dark: { value: "#2d2d2d" },
        success: { value: "#2ecc71" },
        error: { value: "#dc3545" },
      },
      spacing: {
        xs: { value: "0.25rem" },
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "1.5rem" },
        xl: { value: "2rem" },
      },
      padding: {
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "1.5rem" },
      },
      inputWidths: {
        md: { value: "25rem" },
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
      },
      radius: {
        sm: { value: "0.25rem" },
      },
      fonts: {
        body: { value: "Inter, Helvetica, sans-serif" },
      },
    }),
    semanticTokens: defineTokens({
      colors: {
        bg: { value: "{colors.white}" },
        bgSecondary: { value: "{colors.gray.50}" },
        fg: { value: "{colors.neutral}" },
        fgSecondary: { value: "{colors.black}" },
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
        buttonDisabledBg: { value: "{colors.gray.600}" },
        headerBg: { value: "{colors.white}" },
        headerBorder: { value: "{colors.black}" },
        headerFg: { value: "{colors.neutral}" },
        pageDescriptionColor: { value: "{colors.black}" },
        inputColor: { value: "{colors.neutral}" },
        errorColor: { value: "{colors.error}" },
        buttonBackgroundColor: { value: "{colors.dark}" },
        buttonSecondaryBorderColor: { value: "{colors.gray.200}" },
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
