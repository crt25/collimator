/**
 * Manual Jest mock for navigation-observer.
 *
 * useNavigationObserver calls useRouter() internally and registers listeners
 * on router.events, window popstate, and window unhandledrejection. None of
 * these exist in jsdom, so the real hook would crash. This mock replaces it with
 * a no-op that satisfies the hook's return type without touching any browser
 * globals.
 */
export const useNavigationObserver = jest.fn(() => jest.fn());
