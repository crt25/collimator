import * as client from "openid-client";
import { AuthenticationError } from "@/errors/authentication";
import { sessionStorage } from "..";

const codeChallengeMethod = "S256";
const scope = "openid email";

const openIdConnectStateSessionStorageKey = "openIdConnect:state";
const openIdConnectCodeVerifierSessionStorageKey =
  "openIdConnect:code_verifier";
const openIdConnectNonceSessionStorageKey = "openIdConnect:nonce";
const openIdConnectIsStudentSessionStorageKey = "openIdConnect:isStudent";
const openIdConnectRedirectAfterLoginSessionStorageKey =
  "openIdConnect:redirect_after_login";

export const redirectToOpenIdConnectProvider = async (
  server: string,
  clientId: string,
  redirectPath: string,
  isStudent: boolean,
): Promise<void> => {
  const config = await client.discovery(new URL(server), clientId);

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

  // store the code verifier, state and nonce in the session storage
  sessionStorage.setItem(openIdConnectStateSessionStorageKey, state);
  sessionStorage.setItem(
    openIdConnectCodeVerifierSessionStorageKey,
    codeVerifier,
  );
  if (nonce) {
    sessionStorage.setItem(openIdConnectNonceSessionStorageKey, nonce);
  }

  // set the user role in the session storage
  window.sessionStorage.setItem(
    openIdConnectIsStudentSessionStorageKey,
    isStudent ? "true" : "false",
  );

  // and finally store an optional redirect url in the session storage
  sessionStorage.setItem(
    openIdConnectRedirectAfterLoginSessionStorageKey,
    redirectPath,
  );

  window.location.href = redirectTo.href;
};

export const authenticate = async (
  server: string,
  clientId: string,
): Promise<{
  idToken: string;
  claims: client.IDToken;
  userInfo: client.UserInfoResponse;
  isStudent: boolean;
  redirectPath: string;
}> => {
  const config = await client.discovery(new URL(server), clientId, {});

  // retrieve code verifier from session storage
  const codeVerifier = sessionStorage.getAndDelete(
    openIdConnectCodeVerifierSessionStorageKey,
  );

  // retrieve state from session storage
  const state = sessionStorage.getAndDelete(
    openIdConnectStateSessionStorageKey,
  );

  const nonce = sessionStorage.tryGetAndDelete(
    openIdConnectNonceSessionStorageKey,
    undefined,
  );

  const currentUrl: URL = new URL(window.location.href);
  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedNonce: nonce,
    expectedState: state,
    idTokenExpected: true,
  });

  const idToken = tokens.id_token;

  if (!idToken) {
    throw new AuthenticationError(
      "ID token was not returned by the authorization server",
    );
  }

  const claims = tokens.claims();

  if (!claims) {
    throw new AuthenticationError(
      "TokenEndpointResponse.expires_in was not returned by the authorization server",
    );
  }

  const userInfo = await client.fetchUserInfo(
    config,
    tokens.access_token,
    claims.sub,
  );

  const isStudent =
    sessionStorage.getAndDelete(openIdConnectIsStudentSessionStorageKey) ===
    "true";

  const redirectPath = sessionStorage.getAndDelete(
    openIdConnectRedirectAfterLoginSessionStorageKey,
  );

  return {
    idToken: tokens.id_token,
    claims,
    userInfo,
    isStudent,
    redirectPath,
  };
};
