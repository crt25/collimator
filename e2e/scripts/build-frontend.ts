import { buildFrontend, getFrontendMode } from "../setup/helpers";
import { mockOidcClientId, mockOidcProxyUrl } from "../setup/config";

const main = async (): Promise<void> => {
  if (getFrontendMode() === "dev") {
    console.log(
      "Skipping the frontend build: E2E_FRONTEND=dev, the tests run against a dev server",
    );
    return;
  }

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
