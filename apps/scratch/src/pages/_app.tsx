import "../index.global.css";
import { Toaster } from "react-hot-toast";
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
      </Head>
      <CacheProvider value={cache}>
        <Toaster />
        <Component {...pageProps} />
      </CacheProvider>
    </div>
  );
};

export default App;
