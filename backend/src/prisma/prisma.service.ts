import { Injectable, Type } from "@nestjs/common";
import { PrismaProvider } from "./prisma.provider";

// NOTE:
// We need PrismaService to have the type of the extended client with all default client methods and our extensions,
// but we can't directly extended a function call like client.extends(extension) or PrismaProvider.withExtensions().
// This workaround creates a class type that returns the extended client from its constructor, cast it with the extended client's type,
// so that PrismaService can extend it properly.
const ExtendedPrismaClient = class {
  constructor(provider: PrismaProvider) {
    return provider.withExtensions();
  }
} as Type<ReturnType<PrismaProvider["withExtensions"]>>;

@Injectable()
export class PrismaService extends ExtendedPrismaClient {
  constructor(provider: PrismaProvider) {
    super(provider);
  }
}
