import { buildFrontend } from "../setup/helpers";
import { mockOidcClientId, mockOidcProxyUrl } from "../setup/config";

const main = async (): Promise<void> => {
  buildFrontend({
    // use a relative path s.t. we don't have to rebuild the frontend for each test
    backendHostname: "",
    oidcUrl: mockOidcProxyUrl,
    oidcClientId: mockOidcClientId,
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
