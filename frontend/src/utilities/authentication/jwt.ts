import { getJwkSet } from "./openid-connect";
import * as jose from "jose";

/**
 * Verify a JWT token using the public key from the server.
 * Note that there is a copy of this function in the backend in authentication.service.ts.
 * @param client The JwksClient instance to use for retrieving the public key.
 * @param jwtToken The JWT token to verify.
 * @param audience The audience to verify the token against.
 * @returns The payload of the verified token.
 */
export const verifyJwtToken = async (
  jwtToken: string,
  audience: string,
): Promise<
  jose.JWTVerifyResult<jose.JWTPayload> & jose.ResolvedKey<jose.KeyLike>
> => {
  const jwkSet = await getJwkSet();

  return await jose.jwtVerify(jwtToken, jwkSet, {
    algorithms: [
      "RS256",
      "RS384",
      "RS512",
      "ES256",
      "ES384",
      "ES512",
      "PS256",
      "PS384",
      "PS512",
    ],
    audience,
    clockTolerance: 0,
  });
};
