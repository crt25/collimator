import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <script src="http://localhost:3000/build/scratch.js" />
      <body>
        <Main />
        <NextScript />
        <div id="scratch" />
      </body>
    </Html>
  );
}
