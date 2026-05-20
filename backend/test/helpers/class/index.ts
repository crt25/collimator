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

export const createClasses = async (
  app: INestApplication,
  options: {
    count: number;
    startId: number;
    teacherId: number;
    namePrefix: string;
  },
): Promise<void> => {
  const prisma = app.get(PrismaService);
  const classesData = Array.from({ length: options.count }, (_, i) => ({
    id: options.startId + i,
    name: `${options.namePrefix} ${options.startId + i}`,
    teacherId: options.teacherId,
    deletedAt: null,
  }));

  await prisma.class.createMany({
    data: classesData,
  });
};
