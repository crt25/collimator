import { subtle } from "crypto";
import * as fs from "fs";
import { BrowserContext, Page } from "@playwright/test";
import { Encoder, Decoder, Packet, PacketType } from "socket.io-parser";
import {
  getAuthenticationControllerFindPublicKeyV0Url,
  getAuthenticationControllerLoginV0Url,
} from "@/api/collimator/generated/endpoints/authentication/authentication";
import { getUsersControllerUpdateKeyV0Url } from "@/api/collimator/generated/endpoints/users/users";
import {
  AuthenticationResponseDto,
  PublicKeyDto,
  UserType,
} from "@/api/collimator/generated/models";
import {
  StudentAuthenticationRequest,
  StudentAuthenticationRequestContent,
  StudentAuthenticationResponse,
} from "@/types/websocket-events";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import { decodeBase64, encodeBase64 } from "@/utilities/crypto/base64";
import { jsonResponse } from "../helpers";

const crypto = subtle as SubtleCrypto;

export const userName = "Jane Doe";
export const userEmail = "janedoe@example.com";
export const issuer = "http://localhost:3000/issuer";
export const sub = "1234567890";

export const adminFile = "playwright/.auth/admin.json";
export const studentFile = "playwright/.auth/student.json";

export const generateKey = async (): Promise<[CryptoKeyPair, JsonWebKey]> => {
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

const decoder = new Decoder();
const encoder = new Encoder();
const typedEncode = encoder.encode.bind(encoder) as unknown as (
  packet: Packet,
) => [string];
const encode = (packet: Packet): string => "4" + typedEncode(packet)[0];

export const generateJwt = async (
  keyPair: CryptoKeyPair,
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
    email: userEmail,
    name: userName,
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
  ...jsonResponse,
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
  apiUrl: string,
): Promise<string> => {
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
    const postData = route.request().postData() ?? "";

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
        name: userName,
        given_name: "Jane",
        family_name: "Doe",
        preferred_username: "j.doe",
        email: userEmail,
        picture: "http://example.com/janedoe/me.jpg",
      }),
    });
  });

  const teacherKeyPair = await TeacherLongTermKeyPair.generate(crypto);
  const teacherPublicKey = await teacherKeyPair.exportPublicKey();
  const teacherPublicKeyHash = await teacherKeyPair.getPublicKeyFingerprint();

  await page.route(
    `${apiUrl}${getAuthenticationControllerFindPublicKeyV0Url(teacherPublicKeyHash)}`,
    (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify({
          id: 1,
          teacherId: 1,
          createdAt: new Date().toISOString(),
          publicKey: JSON.stringify(teacherPublicKey),
        } as PublicKeyDto),
      }),
  );

  await page.route(
    `${apiUrl}${getAuthenticationControllerLoginV0Url()}`,
    (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify({
          id: 1,
          authenticationToken: "a token",
          email: userEmail,
          name: userName,
          type: UserType.ADMIN,
          keyPair: null,
        } as AuthenticationResponseDto),
      }),
  );

  await page.route(`${apiUrl}${getUsersControllerUpdateKeyV0Url(1)}`, (route) =>
    route.fulfill({
      ...jsonResponse,
      body: JSON.stringify(1),
    }),
  );

  await page.routeWebSocket(/socket\.io/, async (ws) => {
    const connectMessage = encode({
      type: 0,
      nsp: "/",
      data: {
        sid: "E9efP6492KDwJe5sAAAv",
        upgrades: [],
        pingInterval: 25000,
        pingTimeout: 20000,
        maxPayload: 1000000,
      },
    });

    // first message without '4' prefix
    ws.send(connectMessage.substring(1));

    ws.onMessage(async (message) => {
      if (typeof message !== "string") {
        throw new Error("Expected message to be a string");
      }

      const waitForPacket = new Promise<Packet>((resolve) =>
        decoder.once("decoded", resolve),
      );
      // always drop the first '4' character - socket.io protocol
      decoder.add(message.substring(1));

      const packet = await waitForPacket;

      // see protocol definition at https://socket.io/docs/v4/socket-io-protocol/#exchange-protocol

      if (packet.type === PacketType.CONNECT) {
        // on connection, respond
        ws.send(connectMessage);
        return;
      }

      if (packet.type === PacketType.DISCONNECT) {
        ws.close();
        return;
      }

      // not sure why this is sent, the protocol definition does not mention this being sent by the client
      if (packet.type === PacketType.CONNECT_ERROR) {
        ws.send('40{"sid":"ajVdtT-qu_urvILFAAA0"}');
        return;
      }

      if (
        packet.type === PacketType.EVENT &&
        Array.isArray(packet.data) &&
        packet.data.length >= 1
      ) {
        const [event, data] = packet.data as [string, unknown];

        if (event === "requestTeacherToSignInStudent") {
          const { studentPublicKey, encryptedAuthenticationRequest } =
            data as StudentAuthenticationRequest;

          const ephemeralKey = await teacherKeyPair.deriveSharedEphemeralKey(
            JSON.parse(studentPublicKey),
          );

          // ensure decryption is successful
          const request = JSON.parse(
            await ephemeralKey.decryptString(
              decodeBase64(encryptedAuthenticationRequest),
            ),
          ) as StudentAuthenticationRequestContent;

          // we skip the verification of the id token here
          const studentName = request.isAnonymous
            ? request.pseudonym
            : JSON.parse(
                Buffer.from(
                  request.idToken.split(".")[1],
                  "base64url",
                ).toString("utf-8"),
              )["name"];

          ws.send(
            encode({
              type: 2,
              nsp: packet.nsp,
              data: [
                "studentAuthenticationToken",
                {
                  // use the student's name as the authentication token
                  authenticationToken: encodeBase64(
                    await ephemeralKey.encryptString(studentName),
                  ),
                } as StudentAuthenticationResponse,
              ],
            }),
          );
        }
      }
    });
  });

  return teacherPublicKeyHash;
};

export const signIn = async (page: Page): Promise<void> => {
  await page.waitForSelector("[data-testid=signin-button]");
  await page.getByTestId("signin-button").click();
};

export const useAdminUser = async (context: BrowserContext): Promise<void> => {
  // https://playwright.dev/docs/auth#session-storage
  const sessionStorage = JSON.parse(fs.readFileSync(adminFile, "utf-8"));
  await context.addInitScript((storage: Record<string, string>) => {
    if (window.location.hostname === "localhost") {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }
  }, sessionStorage);
};

export const useStudentUser = async (
  context: BrowserContext,
): Promise<void> => {
  // https://playwright.dev/docs/auth#session-storage
  const sessionStorage = JSON.parse(fs.readFileSync(studentFile, "utf-8"));
  await context.addInitScript((storage: Record<string, string>) => {
    if (window.location.hostname === "localhost") {
      for (const [key, value] of Object.entries(storage)) {
        window.sessionStorage.setItem(key, value);
      }
    }
  }, sessionStorage);
};
