// Solution based on https://github.com/vercel/next.js/discussions/32231#discussioncomment-6351802

import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";

const errorMessage = "[NavigationObserver] Please ignore this error.";

const throwFakeErrorToFoolNextRouter = (): void => {
  // Throwing an actual error class trips the Next.JS 500 Page, this string literal does not.
  // eslint-disable-next-line no-throw-literal
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
  const currentPath = router.asPath;
  const nextPath = useRef("");
  const navigationConfirmed = useRef(false);

  const killRouterEvent = useCallback(() => {
    router.events.emit("routeChangeError", "", "", { shallow: false });
    throwFakeErrorToFoolNextRouter();
  }, [router]);

  useEffect(() => {
    navigationConfirmed.current = false;

    const onRouteChange = (url: string): void => {
      if (currentPath !== url) {
        // if the user clicked on the browser back button then the url displayed in the browser gets incorrectly updated
        // This is needed to restore the correct url.
        // note: history.pushState does not trigger a page reload
        window.history.pushState(null, "", router.basePath + currentPath);
      }

      if (
        shouldStopNavigation() &&
        url !== currentPath &&
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
    currentPath,
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
