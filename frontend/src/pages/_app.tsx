import "@/styles/globals.scss";
import English from "../../content/compiled-locales/en.json";
import French from "../../content/compiled-locales/fr.json";
import type { AppProps } from "next/app";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AuthenticationContext,
  authenticationContextDefaultValue,
  AuthenticationContextType,
  deserializeAuthenticationContext,
  serializeAuthenticationContext,
} from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import AuthenticationBarrier from "@/components/authentication/AuthenticationBarrier";
import { PrimeReactProvider } from "primereact/api";
import YupLocalization from "@/components/form/YupLocalization";

const authenticationStateKey = "authenticationState";

const cache = createCache({ key: "next" });

const getInitialState = async (): Promise<AuthenticationContextType> => {
  if (typeof sessionStorage === "undefined") {
    // for SSR we return the default value
    return authenticationContextDefaultValue;
  }

  // load the stored authentication state from sessionStorage
  const storedAuthenticationState = sessionStorage.getItem(
    authenticationStateKey,
  );

  return storedAuthenticationState
    ? deserializeAuthenticationContext(
        window.crypto.subtle,
        JSON.parse(storedAuthenticationState),
      )
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
        // store the new state in the session storage asynchronously
        serializeAuthenticationContext(newState)
          .then((serializedNewState) => {
            sessionStorage.setItem(
              authenticationStateKey,
              JSON.stringify(serializedNewState),
            );
          })
          .catch((e) => {
            console.error("Failed to store serialized authentication state", e);
          });

        // synchronously return the new state
        return newState;
      }),
    [],
  );

  useEffect(() => {
    // load the stored authentication state from sessionStorage
    getInitialState().then((initialState) => {
      updateAuthenticationState(initialState);
      setAuthenticationStateLoaded(true);
    });
    // we only want to run this effect once when mounting the component
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
