import { ExecutionContext, Injectable } from "@nestjs/common";
import {
  AuthenticationToken,
  AuthenticationTokenType,
  Student,
  User,
  UserType,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { ConfigService } from "@nestjs/config";
import ms from "ms";

export type AuthToken = string;

// we use a sliding window for token expiration checked against the last used timestamp
const httpSlidingTokenLifetime = ms("4h");
const webSocketSlidingTokenLifetime = ms("5m");

// to avoid updating the last used timestamp on every request, we only update it if the token was last used more than 10 minutes ago
const httpLastUsedAccuracy = ms("10m");
const webSocketLastUsedAccuracy = ms("1m");

type WithKey = {
  keyPair: {
    id: number;
    publicKey: Buffer;
    publicKeyFingerprint: string;
    createdAt: Date;

    privateKeys: {
      encryptedPrivateKey: Buffer;
      salt: Buffer;
    }[];
  } | null;
};

export type UserIdentity = {
  id: number;
  name: string | null;
  email: string;
  type: UserType;
};

export type WithToken = {
  authenticationToken: AuthToken;
};

export type UserIdentityWithKey = UserIdentity & WithKey;
export type UserIdentityWithKeyAndToken = UserIdentityWithKey & WithToken;

const verifyJwtToken = async (
  client: JwksClient,
  jwtToken: string,
  audience: string,
): Promise<jwt.JwtPayload> => {
  // retrieve the kid from the (unverified) token header
  const unverifiedToken = jwt.decode(jwtToken, { complete: true, json: true });

  if (!unverifiedToken || !unverifiedToken.header.kid) {
    throw new Error("Invalid JWT token");
  }

  // then retrieve the public key from the (trusted) server
  const key = await client.getSigningKey(unverifiedToken.header.kid);

  // and verify the token against the public key
  const jwtOrError = jwt.verify(jwtToken, key.getPublicKey(), {
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
    allowInvalidAsymmetricKeyTypes: false,
    audience,
    clockTimestamp: Date.now() / 1000,
    clockTolerance: 0,
  });

  if (typeof jwtOrError === "string") {
    throw new Error(jwtOrError);
  }

  return jwtOrError;
};

// generate strong, cryptographically secure token
// 128 bits (16 bytes) should be plenty, let's use 256 for good measure
const generateToken = (): AuthToken => randomBytes(32).toString("hex");

export enum AuthenticationProvider {
  microsoft = "microsoft",
}

@Injectable()
export class AuthenticationService {
  private readonly microsoftJwkClient: JwksClient;
  private readonly microsoftClientId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const microsoftClientId = this.configService.get<string>(
      "OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID",
    );

    const microsoftJwkEndpoint = this.configService.get<string>(
      "OPEN_ID_CONNECT_JWK_ENDPOINT",
    );

    if (!microsoftClientId) {
      throw new Error("OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID is not defined");
    }

    if (!microsoftJwkEndpoint) {
      throw new Error("OPEN_ID_CONNECT_MICROSOFT_SERVER is not defined");
    }

    this.microsoftClientId = microsoftClientId;
    this.microsoftJwkClient = new JwksClient({
      jwksUri: microsoftJwkEndpoint,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: ms("10h"),
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.authenticationToken.deleteMany({
      where: {
        OR: [
          {
            type: AuthenticationTokenType.HTTP,
            lastUsed: { lt: new Date(Date.now() - httpSlidingTokenLifetime) },
          },
          {
            type: AuthenticationTokenType.WEBSOCKET,
            lastUsed: {
              lt: new Date(Date.now() - webSocketSlidingTokenLifetime),
            },
          },
        ],
      },
    });
  }

  protected verifyToken(
    jwt: string,
    provider: AuthenticationProvider,
  ): Promise<jwt.JwtPayload> {
    let client: JwksClient;
    let clientId: string;

    switch (provider) {
      case AuthenticationProvider.microsoft:
        client = this.microsoftJwkClient;
        clientId = this.microsoftClientId;
        break;
      default:
        throw new Error(`Unknown authentication provider: ${provider}`);
    }

    return verifyJwtToken(client, jwt, clientId);
  }

  protected findUserByEmailOrThrow(
    email: string,
  ): Promise<UserIdentityWithKey> {
    return this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        keyPair: {
          select: {
            id: true,
            publicKey: true,
            publicKeyFingerprint: true,
            createdAt: true,
            privateKeys: {
              select: {
                encryptedPrivateKey: true,
                salt: true,
              },
            },
          },
        },
      },
      where: { email },
    });
  }

  /**
   * Tries to sign in a user with the given JWT token.
   * @param jwt The JWT token to sign in with.
   * @returns A new authentication token.
   */
  async signInUser(
    jwt: string,
    provider: AuthenticationProvider,
  ): Promise<UserIdentityWithKeyAndToken> {
    const verifiedToken = await this.verifyToken(jwt, provider);

    const email = verifiedToken["email"];

    if (!email) {
      throw new Error("Email not found in JWT token");
    }

    const user = await this.findUserByEmailOrThrow(email);

    if (!user) {
      throw new Error("User not found");
    }

    const randomToken = generateToken();

    // before signing in, delete all expired tokens
    await this.deleteExpiredTokens();

    const authToken = await this.prisma.authenticationToken.create({
      data: {
        token: randomToken,
        userId: user.id,
        lastUsed: new Date(),
        type: AuthenticationTokenType.HTTP,
      },
    });

    return {
      ...user,
      authenticationToken: authToken.token,
    };
  }

  /**
   * Create a new authentication token for a student with the given pseudonym and class id.
   * @param pseudonym The student's pseudonym encoded in Base64.
   * @param classId The class id the student is in.
   * @param keyPairId The key pair id used to encrypt the pseudonym.
   * @returns A new authentication token.
   */
  async signInStudent(
    pseudonym: string,
    classId: number,
    keyPairId: number,
  ): Promise<AuthToken> {
    const rawPseudonym = Buffer.from(pseudonym, "base64");

    let student = await this.prisma.student.findUnique({
      where: { pseudonymUniquePerClass: { classId, pseudonym: rawPseudonym } },
    });

    if (!student) {
      student = await this.prisma.student.create({
        data: {
          pseudonym: rawPseudonym,
          classId,
          keyPairId,
        },
      });
    }

    const randomToken = generateToken();

    // before signing in, delete all expired tokens
    await this.deleteExpiredTokens();

    const authToken = await this.prisma.authenticationToken.create({
      data: {
        token: randomToken,
        studentId: student.id,
        lastUsed: new Date(),
        type: AuthenticationTokenType.HTTP,
      },
    });

    return authToken.token;
  }

  async findByAuthenticationTokenOrThrow(
    token: AuthToken,
    tokenType: AuthenticationTokenType = AuthenticationTokenType.HTTP,
    clientIp?: string,
  ): Promise<User | Student> {
    const lifetime =
      tokenType === AuthenticationTokenType.HTTP
        ? httpSlidingTokenLifetime
        : webSocketSlidingTokenLifetime;

    const lastUsedAccuracy =
      tokenType === AuthenticationTokenType.HTTP
        ? httpLastUsedAccuracy
        : webSocketLastUsedAccuracy;

    const authToken = await this.prisma.authenticationToken.findUniqueOrThrow({
      where: {
        token,
        // and that it hasn't expired
        lastUsed: { gte: new Date(Date.now() - lifetime) },
        type: tokenType,
        clientIp, // if the client IP is provided, it must match
      },
      include: {
        user: true,
        student: true,
      },
    });

    // update the last used timestamp if the last time the token was used is some time ago
    if (authToken.lastUsed < new Date(Date.now() - lastUsedAccuracy)) {
      await this.prisma.authenticationToken.update({
        where: { token },
        data: { lastUsed: new Date() },
      });
    }

    if (authToken.user) {
      return authToken.user;
    }

    if (authToken.student) {
      return authToken.student;
    }

    throw new Error("Token does not belong to a user or student");
  }

  async issueWebsocketAuthenticationToken(
    user: User | Student,
    clientIp: string,
  ): Promise<AuthenticationToken> {
    const randomToken = generateToken();

    const wsToken = {
      token: randomToken,
      clientIp,
      lastUsed: new Date(),
      type: AuthenticationTokenType.WEBSOCKET,
    };

    let token: AuthenticationToken;

    if (this.isStudent(user)) {
      token = await this.prisma.authenticationToken.create({
        data: {
          ...wsToken,
          studentId: user.id,
        },
      });
    } else {
      token = await this.prisma.authenticationToken.create({
        data: {
          ...wsToken,
          userId: user.id,
        },
      });
    }

    return token;
  }

  isStudent(user: User | Student): user is Student {
    return "pseudonym" in user;
  }

  static setKeyOnContext<T>(
    context: ExecutionContext,
    key: string,
    value: T,
  ): void {
    const type = context.getType();

    if (type === "http") {
      const request = context.switchToHttp().getRequest();
      request[key] = value;
      return;
    } else if (type === "ws") {
      const client = context.switchToWs().getClient();
      client[key] = value;
      return;
    }

    throw new Error(`Unsupported context type '${type}'`);
  }

  static getKeyFromContext<T>(
    context: ExecutionContext,
    key: string,
  ): T | null {
    const type = context.getType();

    if (type === "http") {
      const request = context.switchToHttp().getRequest();
      return (request[key] as T | undefined) ?? null;
    } else if (type === "ws") {
      const client = context.switchToWs().getClient();
      return (client[key] as T | undefined) ?? null;
    }

    throw new Error(`Unsupported context type '${type}'`);
  }
}
