import { INestApplication } from "@nestjs/common";
import { Class } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const createClassWithId = async (
  app: INestApplication,
  options: {
    id: number;
    teacherId: number;
    name?: string;
  },
): Promise<Class> => {
  const prisma = app.get(PrismaService);

  return prisma.class.create({
    data: {
      id: options.id,
      name: options.name ?? `Test Class ${options.id}`,
      teacherId: options.teacherId,
      deletedAt: null,
    },
  });
};
