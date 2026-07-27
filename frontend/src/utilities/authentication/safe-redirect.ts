const defaultRedirectPath = "/";

export const getSafeInternalRedirectPath = (
  redirectPath: unknown,
  fallback = defaultRedirectPath,
): string => {
  if (
    typeof redirectPath !== "string" ||
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//") ||
    redirectPath.includes("\\")
  ) {
    return fallback;
  }

  return redirectPath;
};
