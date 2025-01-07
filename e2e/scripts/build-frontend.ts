import { buildFrontend } from "../setup/helpers";
import { isDebug } from "../helpers";
import { mockOidcProxyUrl } from "../setup/config";

const main = async (): Promise<void> => {
  buildFrontend(
    {
      // use a relative path s.t. we don't have to rebuild the frontend for each test
      backendHostname: "",
      oidcUrl: process.env.OIDC_MOCK_SERVER_PROXY_URL,
      oidcClientId: mockOidcProxyUrl,
    },
    isDebug ? "pipe" : "ignore",
    "pipe",
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
