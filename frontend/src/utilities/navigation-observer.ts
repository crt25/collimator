// Solution based on https://github.com/vercel/next.js/discussions/32231#discussioncomment-6351802

import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";

const errorMessage = "[NavigationObserver] Please ignore this error.";

const throwFakeErrorToFoolNextRouter = (): void => {
  // Throwing an actual error class trips the Next.JS 500 Page, this string literal does not.
  throw errorMessage;
};

const rejectionHandler = (event: PromiseRejectionEvent): void => {
  if (event.reason === errorMessage) {
    event.preventDefault();
  }
};
interface Props {
  shouldStopNavigation: () => boolean;
  onNavigate: () => void;
}

const useNavigationObserver = ({
  shouldStopNavigation,
  onNavigate,
}: Props): (() => void) => {
  const router = useRouter();
  const nextPath = useRef("");

  // Do not replace this ref with router.asPath as a direct dependency.
  // router.asPath updates even when we block navigation via the killRouterEvent() method
  // If this is used as a useEffect dependency, React would see the value changed and
  // remove the old routeChangeStart listener, then attach a new one. During
  // the teardown, there's a brief window where no listener is attached, this can cause missed events
  const currentPathRef = useRef(router.asPath);
  const navigationConfirmed = useRef(false);

  const killRouterEvent = useCallback(() => {
    router.events.emit("routeChangeError", "", "", { shallow: false });
    throwFakeErrorToFoolNextRouter();
  }, [router]);

  useEffect(() => {
    currentPathRef.current = router.asPath;
  }, [router.asPath]);

  useEffect(() => {
    navigationConfirmed.current = false;

    const onRouteChange = (url: string): void => {
      if (currentPathRef.current !== url) {
        // if the user clicked on the browser back button then the url displayed in the browser gets incorrectly updated
        // This is needed to restore the correct url.

        // We use replaceState instead of pushState because it does not create a new entry in the browser history.

        // let's say the sequence is:
        // 1. history: [A, B, C] (current page)
        // 2. user clicks back -> [A, B, C] the cursor is now at B, the forward to C is still available
        // 3. push a new state D after B -> [A, B, D] then C is removed from the history
        // 4. the forward button will not be available

        // with replaceSate, 3. becomes [A, D, C] the cursor is at D but the forward to C is still available
        window.history.replaceState(
          null,
          "",
          router.basePath + currentPathRef.current,
        );
      }

      if (
        shouldStopNavigation() &&
        url !== currentPathRef.current &&
        !navigationConfirmed.current
      ) {
        // removing the basePath from the url as it will be added by the router
        nextPath.current = url.replace(router.basePath, "");
        onNavigate();
        killRouterEvent();
      }
    };

    router.events.on("routeChangeStart", onRouteChange);
    window.addEventListener("unhandledrejection", rejectionHandler);

    return (): void => {
      router.events.off("routeChangeStart", onRouteChange);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, [
    killRouterEvent,
    onNavigate,
    router.basePath,
    router.events,
    shouldStopNavigation,
  ]);

  const confirmNavigation = (): void => {
    navigationConfirmed.current = true;
    // avoid pushing a new entry to the history stack, we want to replace the current url with the next url
    router.replace(nextPath.current);
  };

  return confirmNavigation;
};

export { useNavigationObserver };
