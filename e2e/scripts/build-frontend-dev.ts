import { buildFrontend } from "../setup/helpers";
import { mockOidcClientId, mockOidcProviderUrl } from "../setup/config";

/**
 * Frontend build for the interactive dev stack (scripts/dev-stack.ts): unlike
 * the e2e build, the OIDC issuer is the mock provider's plain-http URL so a
 * real browser can complete the login flow (the e2e suite intercepts the
 * https issuer in-page instead).
 */
const main = async (): Promise<void> => {
  buildFrontend({
    // use a relative path s.t. we don't have to rebuild the frontend for each test
    backendHostname: "",
    oidcUrl: mockOidcProviderUrl,
    oidcClientId: mockOidcClientId,
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
