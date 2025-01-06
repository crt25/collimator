import { randomBytes } from "crypto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Prisma, KeyPair, RegistrationToken } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UserId } from "./dto";
import { CreateKeyPairDto } from "./dto/create-key-pair.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: UserId): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  findMany(args?: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  create(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  update(id: UserId, user: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      data: user,
      where: { id },
    });
  }

  async updateTeacherKey(
    userId: UserId,
    teacherKey: CreateKeyPairDto,
  ): Promise<KeyPair> {
    const publicKey = Buffer.from(teacherKey.publicKey, "utf-8");
    const salt = Buffer.from(teacherKey.salt, "base64");

    const privateKeys = teacherKey.privateKeys.map((privateKey) => ({
      encryptedPrivateKey: Buffer.from(
        privateKey.encryptedPrivateKey,
        "base64",
      ),
      salt: Buffer.from(privateKey.salt, "base64"),
    }));

    // Delete the current key pair
    // Note that this makes all non re-encrypted pseudonyms unreadabe (which may be intentional)
    await this.prisma.keyPair.deleteMany({
      where: { teacherId: userId },
    });

    // Create a new public key and add the new private keys
    return await this.prisma.keyPair.create({
      data: {
        publicKey,
        publicKeyFingerprint: teacherKey.publicKeyFingerprint,
        privateKeys: {
          create: privateKeys,
        },
        teacherId: userId,
        salt,
      },
    });
  }

  async createRegistrationTokenOrThrow(
    userId: UserId,
  ): Promise<RegistrationToken> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.oidcSub !== null) {
      throw new ForbiddenException();
    }

    // generate strong, cryptographically secure token
    // 128 bits (16 bytes) should be plenty, let's use 256 for good measure
    const token = randomBytes(32).toString("hex");

    await this.prisma.registrationToken.deleteMany({
      where: {
        userId,
      },
    });

    return await this.prisma.registrationToken.create({
      data: {
        token,
        userId,
      },
    });
  }

  deleteById(id: UserId): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
