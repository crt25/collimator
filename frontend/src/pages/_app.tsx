import "@/styles/globals.scss";
import English from "../../content/compiled-locales/en.json";
import French from "../../content/compiled-locales/fr.json";
import type { AppProps } from "next/app";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import { useMemo } from "react";

const cache = createCache({ key: "next" });

const App = ({ Component, pageProps }: AppProps) => {
  const { locale } = useRouter();

  const messages = useMemo(() => {
    switch (locale) {
      case "fr":
        return French;
      default:
        return English;
    }
  }, [locale]);

  return (
    <CacheProvider value={cache}>
      <IntlProvider locale={locale || "en"} messages={messages}>
        <Component {...pageProps} />
      </IntlProvider>
    </CacheProvider>
  );
};

export default App;
