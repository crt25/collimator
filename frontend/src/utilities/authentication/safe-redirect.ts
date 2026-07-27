const defaultRedirectPath = "/";

// True if the string contains a C0 (0x00-0x1F) or C1/DEL (0x7F-0x9F) control
// character. Browsers strip these (notably CR, LF, TAB) while parsing a URL.
const hasControlCharacter = (value: string): boolean => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
      return true;
    }
  }
  return false;
};

/**
 * Returns `redirectPath` only when it is a safe, same-origin, root-relative
 * path; otherwise returns `fallback`. Guards against open redirects.
 *
 * Following OWASP guidance, this does not rely on string-matching alone: it
 * also rejects control characters (literal or percent-encoded) and validates
 * that the path resolves to the current origin. A payload like `/%0A//evil.com`
 * passes a naive `startsWith("//")` check, yet the browser strips the decoded
 * newline while parsing and collapses it into a protocol-relative external URL.
 */
export const getSafeInternalRedirectPath = (
  redirectPath: unknown,
  fallback = defaultRedirectPath,
): string => {
  if (typeof redirectPath !== "string") {
    return fallback;
  }

  // Must be a root-relative path. Reject protocol-relative ("//host") and
  // backslash forms ("\\host", "/\\host") that browsers treat as a network-path
  // reference to an external host.
  if (
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//") ||
    redirectPath.includes("\\")
  ) {
    return fallback;
  }

  // Reject control characters, whether literal or percent-encoded. Decode
  // first so that e.g. "/%0A//evil.com" is caught by the decoded newline.
  let decoded: string;
  try {
    decoded = decodeURIComponent(redirectPath);
  } catch {
    return fallback; // malformed percent-encoding
  }
  if (hasControlCharacter(decoded)) {
    return fallback;
  }

  // Defence in depth: resolve against a fixed origin and require the result to
  // stay on it. Any absolute, protocol-relative or scheme-bearing URL resolves
  // to a different origin and is rejected.
  try {
    const base = "https://collimator.invalid";
    if (new URL(redirectPath, base).origin !== base) {
      return fallback;
    }
  } catch {
    return fallback; // not parseable as a URL
  }

  return redirectPath;
};
