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
        // note: history.pushState does not trigger a page reload
        window.history.pushState(
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
    currentPathRef,
    killRouterEvent,
    onNavigate,
    router.basePath,
    router.events,
    shouldStopNavigation,
  ]);

  const confirmNavigation = (): void => {
    navigationConfirmed.current = true;
    router.push(nextPath.current);
  };

  return confirmNavigation;
};

export { useNavigationObserver };
