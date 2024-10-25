import { test } from "playwright-test-coverage";
import { generateJwt, generateKey, sub } from "./authentication-helpers";

const response = {
  status: 200,
  contentType: "application/json",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};

let nonce = "some nonce";

test.describe("/login", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const [keyPair, publicKey] = await generateKey();

    // intercept the openid configuration request
    await page.route(/.well-known\/openid-configuration/, (route) => {
      route.fulfill({
        ...response,
        body: JSON.stringify({
          authorization_endpoint: `https://localhost:3000/authorize`,
          token_endpoint: `https://localhost:3000/token-request`,
          jwks_uri: `https://localhost:3000/jwks`,
          userinfo_endpoint: `https://localhost:3000/userinfo`,
          token_endpoint_auth_methods_supported: ["client_secret_post"],
          response_modes_supported: ["query", "fragment", "form_post"],
          id_token_signing_alg_values_supported: ["ES256"],
          response_types_supported: [
            "code",
            "id_token",
            "code id_token",
            "id_token token",
          ],
          scopes_supported: ["openid", "profile", "email", "offline_access"],
          issuer: "http://localhost:3000/issuer",
          request_uri_parameter_supported: false,

          http_logout_supported: false,
          frontchannel_logout_supported: false,
          claims_supported: ["sub", "iss", "aud", "exp", "iat", "email"],
        }),
      });
    });

    // intercept the jwks request
    await page.route(/jwks/, (route) => {
      route.fulfill({
        ...response,
        body: JSON.stringify({
          keys: [publicKey],
        }),
      });
    });

    // intercept the authorization request
    await page.route(/redirect_uri=/, (route, request) => {
      // extract redirect_uri from the request
      const [_, redirectUri] = request.url().match(/redirect_uri=([^&]+)/) as [
        string,
        string,
      ];

      // extract nonce, and state from the request
      const [__, nonceInUrl] = request.url().match(/nonce=([^&]+)/) as [
        string,
        string,
      ];
      const [___, state] = request.url().match(/state=([^&]+)/) as [
        string,
        string,
      ];

      nonce = nonceInUrl;

      route.fulfill({
        status: 302,
        headers: {
          location: `${baseURL!}/login/oidc-redirect?code=abc&state=${state}&nonce=${nonceInUrl}&redirect_uri=${redirectUri}`,
        },
      });
    });

    // intercept token request
    await page.route(/token-request/, async (route) => {
      // get post data as string
      const postData = route.request().postData() || "";

      // get client_id from post data
      const [_, clientId] = postData.match(/client_id=([^&]+)/) as [
        string,
        string,
      ];

      const jwt = await generateJwt(keyPair, clientId, nonce);

      route.fulfill({
        ...response,
        body: JSON.stringify({
          token_type: "Bearer",
          refresh_token: "8xLOxBtZp8",
          expires_in: 3600,
          id_token: jwt,
          access_token: "fake_access_token",
        }),
      });
    });

    // intercept the userinfo request
    await page.route(/userinfo/, (route) => {
      route.fulfill({
        ...response,
        body: JSON.stringify({
          sub,
          name: "Jane Doe",
          given_name: "Jane",
          family_name: "Doe",
          preferred_username: "j.doe",
          email: "janedoe@example.com",
          picture: "http://example.com/janedoe/me.jpg",
        }),
      });
    });

    await page.goto(`${baseURL!}/?login=test`);
    await page.waitForSelector("[data-testid=signin-button]");
  });

  test("can authenticate as a non-student", async ({ page, baseURL }) => {
    await page.getByTestId("signin-button").click();

    await page.waitForURL(`${baseURL!}/?login=test`);
  });
});
