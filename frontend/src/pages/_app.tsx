import "@/styles/globals.scss";
import English from "../../content/compiled-locales/en.json";
import French from "../../content/compiled-locales/fr.json";
import type { AppProps } from "next/app";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import YupLocalization from "@/components/form/YupLocalization";
import {
  AuthenticationContext,
  authenticationContextDefaultValue,
  AuthenticationContextType,
  deserializeAuthenticationContext,
  serializeAuthenticationContext,
} from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import AuthenticationBarrier from "@/components/authentication/AuthenticationBarrier";

const authenticationStateKey = "authenticationState";

const cache = createCache({ key: "next" });

const getInitialState = async (): Promise<AuthenticationContextType> => {
  if (typeof localStorage === "undefined") {
    // for SSR we return the default value
    return authenticationContextDefaultValue;
  }

  // load the stored authentication state from localStorage
  const storedAuthenticationState = localStorage.getItem(
    authenticationStateKey,
  );

  return storedAuthenticationState
    ? deserializeAuthenticationContext(JSON.parse(storedAuthenticationState))
    : authenticationContextDefaultValue;
};

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  const [authenticationStateLoaded, setAuthenticationStateLoaded] =
    useState(false);

  const [authenticationState, setAuthenticationState] =
    useState<AuthenticationContextType>(authenticationContextDefaultValue);

  const updateAuthenticationState = useCallback(
    (newState: AuthenticationContextType) =>
      setAuthenticationState(() => {
        // store the new state in the session storage
        serializeAuthenticationContext(newState).then((serializedNewState) => {
          localStorage.setItem(
            authenticationStateKey,
            JSON.stringify(serializedNewState),
          );
        });

        return newState;
      }),
    [],
  );

  useEffect(() => {
    // load the stored authentication state from localStorage
    getInitialState().then((initialState) => {
      updateAuthenticationState(initialState);
      setAuthenticationStateLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = useMemo(() => {
    switch (router.locale) {
      case "fr":
        return French;
      default:
        return English;
    }
  }, [router.locale]);

  return (
    <CacheProvider value={cache}>
      <IntlProvider locale={router.locale || "en"} messages={messages}>
        <YupLocalization>
          <PrimeReactProvider>
            <AuthenticationContext.Provider value={authenticationState}>
              <UpdateAuthenticationContext.Provider
                value={updateAuthenticationState}
              >
                <AuthenticationBarrier
                  authenticationStateLoaded={authenticationStateLoaded}
                >
                  <Component {...pageProps} />
                </AuthenticationBarrier>
              </UpdateAuthenticationContext.Provider>
            </AuthenticationContext.Provider>
          </PrimeReactProvider>
        </YupLocalization>
      </IntlProvider>
    </CacheProvider>
  );
};

export default App;
