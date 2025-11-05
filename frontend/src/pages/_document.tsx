import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    // Adding the suppressHydrationWarning prop to Html to prevent hydration mismatch warnings
    // see: https://chakra-ui.com/docs/get-started/frameworks/next-app#setup-provider
    <Html suppressHydrationWarning>
      <Head />
      <body>
        <Main />
        <NextScript />
        <div id="scratch" />
      </body>
    </Html>
  );
}
