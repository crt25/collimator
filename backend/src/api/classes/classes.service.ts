import { Injectable } from "@nestjs/common";
import { Class, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ClassId } from "./dto";

type Students = {
  students: {
    studentId: number;
    pseudonym: Uint8Array;
    keyPairId: number | null;
  }[];
};
type Teacher = { teacher: { name: string | null } };
type SessionIds = { sessions: { id: number }[] };

export type ClassExtended = Class & Students & Teacher & SessionIds;
export type ClassWithTeacher = Class & Teacher;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(
    id: ClassId,
    includeSoftDelete = false,
  ): Promise<ClassExtended> {
    const classQuery = includeSoftDelete ? { id } : { id, deletedAt: null };

    return this.prisma.class.findUniqueOrThrow({
      where: classQuery,
      include: {
        sessions: {
          select: {
            id: true,
          },
          where: includeSoftDelete ? undefined : { deletedAt: null }, // filter out soft-deleted sessions
        },
        teacher: { select: { id: true, name: true } },
        students: {
          select: { studentId: true, pseudonym: true, keyPairId: true },
          where: includeSoftDelete ? undefined : { deletedAt: null }, // filter out soft-deleted students
        },
      },
    });
  }

  listClassesWithTeacher(
    args?: Omit<Prisma.ClassFindManyArgs, "select" | "include">,
    includeSoftDelete = false,
  ): Promise<ClassWithTeacher[]> {
    return this.prisma.class.findMany({
      ...args,
      where: {
        deletedAt: includeSoftDelete ? undefined : null,
      },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });
  }

  create(klass: Prisma.ClassUncheckedCreateInput): Promise<Class> {
    const checkedClass: Prisma.ClassCreateInput = {
      name: klass.name,
      teacher: { connect: { id: klass.teacherId } },
    };
    return this.prisma.class.create({ data: checkedClass });
  }

  update(
    id: ClassId,
    klass: Prisma.ClassUpdateInput,
    includeSoftDelete = false,
  ): Promise<Class> {
    return this.prisma.class.update({
      data: klass,
      where: includeSoftDelete ? { id } : { id, deletedAt: null },
    });
  }

  deleteById(id: ClassId): Promise<Class> {
    return this.prisma.class.delete({
      where: { id },
    });
  }
}
