import * as client from "openid-client";
import * as jose from "jose";
import { AuthenticationError } from "@/errors/authentication";
import { sessionStorage } from "..";
import {
  openIdConnectMicrosoftClientId,
  openIdConnectMicrosoftServer,
} from "../constants";

interface OpenIdConnectTemporaryState {
  codeVerifier: string;
  state: string;
  nonce?: string;
  isStudent: boolean;
  redirectPath: string;
  registrationToken?: string;
}

const codeChallengeMethod = "S256";
// https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference
// we need the email address for new users and the profile for names
const scope = "openid email profile";

const openIdConnectStateStorageKey = "openIdConnect";

let config: client.Configuration | null = null;
let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

/**
 * Fetches the OpenID Connect configuration from the server and caches it.
 * When the configuration is already cached, it will be returned immediately.
 */
export const getOpenIdConnectConfig =
  async (): Promise<client.Configuration> => {
    if (config !== null) {
      return config;
    }

    const fetchedConfig = await client.discovery(
      new URL(openIdConnectMicrosoftServer),
      openIdConnectMicrosoftClientId,
    );

    config = fetchedConfig;

    return fetchedConfig;
  };

export const getJwkSet = async (): Promise<
  ReturnType<typeof jose.createRemoteJWKSet>
> => {
  if (jwks !== null) {
    return jwks;
  }

  const config = await getOpenIdConnectConfig();

  const jwksUri = config.serverMetadata().jwks_uri;

  if (!jwksUri) {
    throw new Error(
      "The OpenID Connect server does not provide a JWKS URI, this should not happen.",
    );
  }

  jwks = jose.createRemoteJWKSet(new URL(jwksUri));

  return jwks;
};

export const redirectToOpenIdConnectProvider = async (
  redirectPath: string,
  registrationToken: string | undefined,
  isStudent: boolean,
): Promise<void> => {
  const config = await getOpenIdConnectConfig();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  let nonce: string | undefined = undefined;

  const parameters: Record<string, string> = {
    redirect_uri: `${window.location.protocol}//${window.location.host}/login/oidc-redirect`,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  };

  /**
   * We cannot be sure the AS supports PKCE so we're going to use nonce too. Use
   * of PKCE is backwards compatible even if the AS doesn't support it which is
   * why we're using it regardless.
   */
  if (!config.serverMetadata().supportsPKCE()) {
    nonce = client.randomNonce();
    parameters.nonce = nonce;
  }

  const redirectTo = client.buildAuthorizationUrl(config, parameters);

  const openIdConnectState: OpenIdConnectTemporaryState = {
    state,
    codeVerifier,
    nonce,
    isStudent,
    redirectPath,
    registrationToken,
  };

  // store the code verifier, state and nonce in the session storage
  sessionStorage.setItem(
    openIdConnectStateStorageKey,
    JSON.stringify(openIdConnectState),
  );

  window.location.href = redirectTo.href;
};

export const authenticate = async (): Promise<{
  idToken: string;
  claims: client.IDToken;
  userInfo: client.UserInfoResponse;
  isStudent: boolean;
  redirectPath: string;
  registrationToken: string | null;
}> => {
  const config = await getOpenIdConnectConfig();

  // retrieve state from session storage
  const {
    state,
    nonce,
    codeVerifier,
    isStudent,
    redirectPath,
    registrationToken,
  } = JSON.parse(
    sessionStorage.getAndDelete(openIdConnectStateStorageKey),
  ) as OpenIdConnectTemporaryState;

  const currentUrl: URL = new URL(window.location.href);

  const tokens = await client
    .authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState: state,
      idTokenExpected: true,
    })
    .catch((e) => {
      throw new AuthenticationError(e.message, redirectPath);
    });

  const idToken = tokens.id_token;

  if (!idToken) {
    throw new AuthenticationError(
      "ID token was not returned by the authorization server",
      redirectPath,
    );
  }

  const claims = tokens.claims();

  if (!claims) {
    throw new AuthenticationError(
      "TokenEndpointResponse.expires_in was not returned by the authorization server",
      redirectPath,
    );
  }

  const userInfo = await client.fetchUserInfo(
    config,
    tokens.access_token,
    claims.sub,
  );

  return {
    idToken: tokens.id_token,
    claims,
    userInfo,
    isStudent,
    redirectPath,
    registrationToken: registrationToken ?? null,
  };
};
