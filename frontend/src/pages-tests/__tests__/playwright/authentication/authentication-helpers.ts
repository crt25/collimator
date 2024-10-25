import { Page } from "@playwright/test";
import { subtle, webcrypto } from "crypto";

export const issuer = "http://localhost:3000/issuer";
export const sub = "1234567890";

export const generateKey = async (): Promise<
  [webcrypto.CryptoKeyPair, webcrypto.JsonWebKey]
> => {
  const keyPair = await subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  // export public key to JWK
  const publicKey = await subtle.exportKey("jwk", keyPair.publicKey);

  return [keyPair, publicKey];
};

export const generateJwt = async (
  keyPair: webcrypto.CryptoKeyPair,
  clientId: string,
  nonce: string,
): Promise<string> => {
  const publicKey = await subtle.exportKey("jwk", keyPair.publicKey);

  // create a mock open id connect id token
  const idToken = {
    iss: issuer,
    sub,
    aud: clientId,
    exp: Date.now() + 60 * 60 * 1000,
    iat: Date.now(),
    email: "john@doe.com",
    nonce,
  };

  const jwtHeader = Buffer.from(
    JSON.stringify({
      typ: "JWT",
      alg: "ES256",
      jwk: publicKey,
    }),
  ).toString("base64url");

  const jwtPayload = Buffer.from(JSON.stringify(idToken)).toString("base64url");

  const data = new TextEncoder().encode(jwtHeader + "." + jwtPayload);

  // sign the id token
  const signature = await subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    keyPair.privateKey,
    data,
  );

  const stringSignature = Buffer.from(new Uint8Array(signature)).toString(
    "base64url",
  );

  const jwt = jwtHeader + "." + jwtPayload + "." + stringSignature;

  return jwt;
};

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

export const setupForAuthentication = async (
  page: Page,
  baseUrl: string,
): Promise<void> => {
  const [keyPair, publicKey] = await generateKey();

  // intercept the openid configuration request
  await page.route(/.well-known\/openid-configuration/, (route) => {
    route.fulfill({
      ...response,
      body: JSON.stringify({
        authorization_endpoint: `https://localhost:3000/__oidc__/authorize`,
        token_endpoint: `https://localhost:3000/__oidc__/token-request`,
        jwks_uri: `https://localhost:3000/__oidc__/jwks`,
        userinfo_endpoint: `https://localhost:3000/__oidc__/userinfo`,
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
  await page.route(/\/__oidc__\/jwks/, (route) => {
    route.fulfill({
      ...response,
      body: JSON.stringify({
        keys: [publicKey],
      }),
    });
  });

  // intercept the authorization request
  await page.route(/\/__oidc__\/authorize/, (route, request) => {
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
        location: `${baseUrl}/login/oidc-redirect?code=abc&state=${state}&nonce=${nonceInUrl}&redirect_uri=${redirectUri}`,
      },
    });
  });

  // intercept token request
  await page.route(/\/__oidc__\/token-request/, async (route) => {
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
  await page.route(/\/__oidc__\/userinfo/, (route) => {
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
};

export const signIn = async (page: Page): Promise<void> => {
  await page.waitForSelector("[data-testid=signin-button]");
  await page.getByTestId("signin-button").click();
};

export const signInAndGotoPath = async (
  page: Page,
  baseUrl: string,
  path: string,
): Promise<void> => {
  await setupForAuthentication(page, baseUrl);

  const url = `${baseUrl}${path}`;

  await page.goto(url);
  await signIn(page);
  await page.waitForURL(url);
};
