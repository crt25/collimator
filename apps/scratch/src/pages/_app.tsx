import "../index.global.css";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useEffect } from "react";
import Head from "next/head";
import BrowserModalComponent from "@scratch-submodule/packages/scratch-gui/src/components/browser-modal/browser-modal.jsx";
import { isDevelopment } from "../utilities/constants";
import type { AppProps } from "next/app";

const cache = createCache({ key: "next" });

const suppressWarningsInDevMode = () => {
  if (isDevelopment) {
    const originalWarn = console.error;
    console.error = (...args: unknown[]) => {
      const warningMessage = args[0];
      if (
        typeof warningMessage === "string" &&
        warningMessage.includes("Support for defaultProps will be removed")
      ) {
        return;
      }
      originalWarn(...args);
    };
  }
};

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    suppressWarningsInDevMode();
    const appRoot = document.getElementById("__next") as HTMLElement;

    // @ts-expect-error setAppElement expects a HTMLElement
    BrowserModalComponent.setAppElement(appRoot);
  }, []);

  return (
    <div>
      <Head>
        <title>Scratch</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
        const logModule = "[Iframe Message Buffer]";

        // This script is loaded when the scratch app starts up and before the load event is fired
        // so that we can buffer any incoming iframe messages until the main app is ready to handle them.

        const bufferIncomingMessages = (e) => {
          console.debug(\`\${logModule} Buffering incoming message:\`, e);
          window.bufferedMessages.push(e);
        };

        window.stopBufferingIframeMessages = () => {
          console.debug(
            \`\${logModule} Stopping message buffering, returning \${window.bufferedMessages.length} messages\`
          );
          window.removeEventListener("message", bufferIncomingMessages);

          return window.bufferedMessages;
        };

        console.debug(\`\${logModule} Starting message buffering\`);

        window.bufferedMessages = [];
        window.addEventListener("message", bufferIncomingMessages);
`,
          }}
        />
      </Head>
      <CacheProvider value={cache}>
        <Component {...pageProps} />
      </CacheProvider>
    </div>
  );
};

export default App;
