import { getSafeInternalRedirectPath } from "@/utilities/authentication/safe-redirect";

describe("getSafeInternalRedirectPath", () => {
  describe("accepts safe root-relative paths unchanged", () => {
    it.each([
      "/",
      "/dashboard",
      "/class/5/session/3/task/7",
      "/dashboard?tab=classes&sort=name",
      "/path#section",
      "/search?q=%20quoted%20space",
    ])("%p", (path) => {
      expect(getSafeInternalRedirectPath(path)).toBe(path);
    });
  });

  describe("rejects open-redirect attempts", () => {
    it.each([
      "//evil.com",
      "///evil.com",
      "https://evil.com",
      "http://evil.com",
      "javascript:alert(1)",
      "/\\evil.com",
      "\\\\evil.com",
      // CR/LF/TAB tricks: pass a naive startsWith("//") check, but the browser
      // strips the control char while parsing and collapses to "//evil.com".
      "/%0A//evil.com",
      "/%0d//evil.com",
      "/%09//evil.com",
      "/\t//evil.com",
      "/\n//evil.com",
    ])("%p -> fallback", (path) => {
      expect(getSafeInternalRedirectPath(path)).toBe("/");
    });
  });

  it("rejects malformed percent-encoding", () => {
    expect(getSafeInternalRedirectPath("/%zz")).toBe("/");
  });

  it("rejects non-string input", () => {
    expect(getSafeInternalRedirectPath(undefined)).toBe("/");
    expect(getSafeInternalRedirectPath(null)).toBe("/");
    expect(getSafeInternalRedirectPath(42)).toBe("/");
  });

  it("honours a custom fallback", () => {
    expect(getSafeInternalRedirectPath("//evil.com", "/login")).toBe("/login");
  });
});
