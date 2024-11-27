import { ExecutionContext, Injectable } from "@nestjs/common";
import {
  AuthenticationProvider,
  Student,
  User,
  UserType,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { randomBytes } from "crypto";
import * as jose from "jose";
import { ConfigService } from "@nestjs/config";

export type AuthToken = string;

// we use a sliding window for token expiration checked against the last used timestamp
const slidingTokenLifetime = 1000 * 60 * 60 * 4;

// to avoid updating the last used timestamp on every request, we only update it if the token was last used more than 10 minutes ago
const lastUsedAccuracy = 1000 * 60 * 10;

const registrationTokenLifetime = 1000 * 60 * 10;

export type PublicKey = {
  id: number;
  teacherId: number;
  publicKey: Buffer;
  createdAt: Date;
};

type WithKey = {
  keyPair: {
    id: number;
    publicKey: Buffer;
    publicKeyFingerprint: string;
    salt: Buffer;
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
  oidcSub: string | null;
  authenticationProvider: AuthenticationProvider;
  type: UserType;
};

export type WithToken = {
  authenticationToken: AuthToken;
};

export type UserIdentityWithKey = UserIdentity & WithKey;
export type UserIdentityWithKeyAndToken = UserIdentityWithKey & WithToken;

const selectUserIdentityWithKey = {
  id: true,
  name: true,
  oidcSub: true,
  email: true,
  authenticationProvider: true,
  type: true,
  keyPair: {
    select: {
      id: true,
      publicKey: true,
      publicKeyFingerprint: true,
      salt: true,
      createdAt: true,
      privateKeys: {
        select: {
          encryptedPrivateKey: true,
          salt: true,
        },
      },
    },
  },
};

type KeySet = ReturnType<typeof jose.createRemoteJWKSet>;
type Jwt = jose.JWTVerifyResult<jose.JWTPayload> &
  jose.ResolvedKey<jose.KeyLike>;

/**
 * Verify a JWT token using the public key from the server.
 * Note that there is a copy of this function in the frontend in utils/authentication/jwt.ts.
 * @param keySet The key set to verify the token against.
 * @param jwtToken The JWT token to verify.
 * @param audience The audience to verify the token against.
 * @returns The payload of the verified token.
 */
const verifyJwtToken = async (
  keySet: KeySet,
  jwtToken: string,
  audience: string,
): Promise<Jwt> => {
  return await jose.jwtVerify(jwtToken, keySet, {
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

// generate strong, cryptographically secure token
// 128 bits (16 bytes) should be plenty, let's use 256 for good measure
const generateToken = (): AuthToken => randomBytes(32).toString("hex");

@Injectable()
export class AuthenticationService {
  private readonly microsoftKeySet: KeySet;
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
    this.microsoftKeySet = jose.createRemoteJWKSet(
      new URL(microsoftJwkEndpoint),
    );
  }

  async findPublicKeyByFingerprint(fingerprint: string): Promise<PublicKey> {
    return await this.prisma.keyPair.findUniqueOrThrow({
      select: {
        id: true,
        teacherId: true,
        publicKey: true,
        createdAt: true,
      },
      where: { publicKeyFingerprint: fingerprint },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.authenticationToken.deleteMany({
      where: {
        lastUsedAt: { lt: new Date(Date.now() - slidingTokenLifetime) },
      },
    });

    await this.prisma.registrationToken.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - registrationTokenLifetime) },
      },
    });
  }

  protected verifyToken(
    jwt: string,
    provider: AuthenticationProvider,
  ): Promise<Jwt> {
    let keySet: KeySet;
    let clientId: string;

    switch (provider) {
      case AuthenticationProvider.MICROSOFT:
        keySet = this.microsoftKeySet;
        clientId = this.microsoftClientId;
        break;
      default:
        throw new Error(`Unknown authentication provider: ${provider}`);
    }

    return verifyJwtToken(keySet, jwt, clientId);
  }

  protected findUserByOidcSubOrThrow(
    oidcSub: string,
    authenticationProvider: AuthenticationProvider,
  ): Promise<UserIdentityWithKey> {
    return this.prisma.user.findUniqueOrThrow({
      select: selectUserIdentityWithKey,
      where: {
        uniqueOidcSubPerProvider: {
          oidcSub,
          authenticationProvider,
        },
      },
    });
  }

  protected findUserToRegisterOrThrow(
    email: string,
    authenticationProvider: AuthenticationProvider,
    registrationToken: string,
  ): Promise<UserIdentityWithKey> {
    return this.prisma.user.findUniqueOrThrow({
      select: selectUserIdentityWithKey,
      where: {
        uniqueEmailPerProvider: {
          email,
          authenticationProvider,
        },
        registrationToken: {
          token: registrationToken,
          createdAt: { gte: new Date(Date.now() - registrationTokenLifetime) },
        },
      },
    });
  }

  /**
   * Tries to sign in a user with the given JWT token.
   * @param jwt The JWT token to sign in with.
   * @param provider The authentication provider used for singing in.
   * @param registrationToken An optional registration token required the first time a user signs in.
   * @returns A new authentication token.
   */
  async signInUser(
    jwt: string,
    provider: AuthenticationProvider,
    registrationToken?: string | null,
  ): Promise<UserIdentityWithKeyAndToken> {
    const verifiedToken = await this.verifyToken(jwt, provider);

    const sub = verifiedToken.payload["sub"];

    if (!sub) {
      throw new Error("Sub not found in JWT token");
    }

    let originalError: Error | null = null;

    let user: UserIdentityWithKey;

    const oidcUser = await this.findUserByOidcSubOrThrow(sub, provider).catch(
      // in case the user is not found, we may need to migrate the user from email to oidc sub
      (e) => {
        originalError = e;
        return null;
      },
    );

    if (oidcUser) {
      user = oidcUser;
    } else {
      const email = verifiedToken.payload["email"] as string | undefined;

      if (!email || !registrationToken) {
        throw originalError;
      }
      // migrate user from email to oidc sub.
      // this is necessary because the user might have signed in with email before
      // or the user was created by an admin and there is now way to determine the oidc sub
      // for other email addresses
      user = await this.findUserToRegisterOrThrow(
        email,
        provider,
        registrationToken,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          oidcSub: sub,
        },
      });

      // delete registration token
      await this.prisma.registrationToken.deleteMany({
        where: {
          userId: user.id,
        },
      });
    }

    const email = verifiedToken.payload["email"] as string | undefined;
    if (email && user.email !== email) {
      // update user email address
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email,
        },
      });
    }

    const randomToken = generateToken();

    // before signing in, delete all expired tokens
    await this.deleteExpiredTokens();

    const authToken = await this.prisma.authenticationToken.create({
      data: {
        token: randomToken,
        userId: user.id,
        lastUsedAt: new Date(),
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
        lastUsedAt: new Date(),
      },
    });

    return authToken.token;
  }

  async findByAuthenticationTokenOrThrow(
    token: AuthToken,
  ): Promise<User | Student> {
    const authToken = await this.prisma.authenticationToken.findUniqueOrThrow({
      where: {
        token,
        // the token must not have expired
        lastUsedAt: { gte: new Date(Date.now() - slidingTokenLifetime) },
      },
      include: {
        user: true,
        student: true,
      },
    });

    // update the last used timestamp if the last time the token was used is some time ago
    if (authToken.lastUsedAt < new Date(Date.now() - lastUsedAccuracy)) {
      await this.prisma.authenticationToken.update({
        where: { token },
        data: { lastUsedAt: new Date() },
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
