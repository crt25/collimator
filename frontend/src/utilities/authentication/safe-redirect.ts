const defaultRedirectPath = "/";

// Any Unicode control character (C0, DEL and C1 — includes CR, LF and TAB).
const controlCharacter = /\p{Cc}/u;

/**
 * Returns `redirectPath` when it is a safe, same-origin path; otherwise returns
 * `fallback`. Guards against open redirects.
 *
 * Per OWASP, this validates the parsed URL rather than string-matching: an
 * absolute URL, a protocol-relative `//host`, a backslash `\\host` or a `scheme:`
 * all resolve to a different origin than the page's own and are rejected. The
 * only manual guard is for control characters, which `new URL` silently strips:
 * `/%0A//evil.com` stays same-origin above, yet the browser collapses it into a
 * protocol-relative jump once it decodes the newline.
 */
export const getSafeInternalRedirectPath = (
  redirectPath: unknown,
  fallback = defaultRedirectPath,
): string => {
  if (typeof redirectPath !== "string") {
    return fallback;
  }

  try {
    if (new URL(redirectPath, window.origin).origin !== window.origin) {
      return fallback;
    }
    if (controlCharacter.test(decodeURIComponent(redirectPath))) {
      return fallback;
    }
  } catch {
    // Unparseable URL reference or malformed percent-encoding.
    return fallback;
  }

  return redirectPath;
};
