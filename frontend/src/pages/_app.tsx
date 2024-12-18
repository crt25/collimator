import "@/styles/globals.scss";
import English from "../../content/compiled-locales/en.json";
import French from "../../content/compiled-locales/fr.json";
import type { AppProps } from "next/app";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { IntlProvider } from "react-intl";
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
import {
  defaultLocalizationState,
  LocalizationState,
  SupportedLocale,
  UpdateLocalizationContext,
} from "@/contexts/LocalizationContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import WebSocketProvider from "@/contexts/WebSocketProvider";
import { Toaster } from "react-hot-toast";

const authenticationStateKey = "authenticationState";
const localizationStateKey = "localizationState";

const cache = createCache({ key: "next" });

const getInitialAuthenticationState =
  async (): Promise<AuthenticationContextType> => {
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
  const [authenticationStateLoaded, setAuthenticationStateLoaded] =
    useState(false);

  const [authenticationState, setAuthenticationState] =
    useState<AuthenticationContextType>(authenticationContextDefaultValue);

  const [localizationState, setLocalizationState] =
    useLocalStorage<LocalizationState>(
      localizationStateKey,
      defaultLocalizationState,
    );

  const updateAuthenticationState = useCallback(
    (newState: AuthenticationContextType) => {
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

      // synchronously update the react state
      setAuthenticationState(newState);
    },
    [],
  );

  useEffect(() => {
    // load the stored authentication state from sessionStorage
    getInitialAuthenticationState().then((authenticationState) => {
      updateAuthenticationState(authenticationState);
      setAuthenticationStateLoaded(true);
    });
    // we only want to run this effect once when mounting the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = useMemo(() => {
    switch (localizationState.locale) {
      case SupportedLocale.french:
        return French;
      default:
        return English;
    }
  }, [localizationState.locale]);

  const updateLocalizationState = useMemo(
    () => ({ setState: setLocalizationState }),
    [setLocalizationState],
  );

  return (
    <CacheProvider value={cache}>
      <IntlProvider locale={localizationState.locale} messages={messages}>
        <YupLocalization>
          <PrimeReactProvider>
            <AuthenticationContext.Provider value={authenticationState}>
              <UpdateAuthenticationContext.Provider
                value={updateAuthenticationState}
              >
                <UpdateLocalizationContext.Provider
                  value={updateLocalizationState}
                >
                  <AuthenticationBarrier
                    authenticationStateLoaded={authenticationStateLoaded}
                  >
                    <WebSocketProvider>
                      <Component {...pageProps} />
                      <Toaster
                        toastOptions={{
                          position: "bottom-right",
                          duration: 5000,
                        }}
                      />
                    </WebSocketProvider>
                  </AuthenticationBarrier>
                </UpdateLocalizationContext.Provider>
              </UpdateAuthenticationContext.Provider>
            </AuthenticationContext.Provider>
          </PrimeReactProvider>
        </YupLocalization>
      </IntlProvider>
    </CacheProvider>
  );
};

export default App;
