import { Injectable } from "@nestjs/common";
import { Class, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { ClassId } from "./dto";

type Students = { students: { id: number; pseudonym: string }[] };
type Teacher = { teacher: { name: string | null } };
type SessionIds = { sessions: { id: number }[] };

export type ClassExtended = Class & Students & Teacher & SessionIds;
export type ClassWithTeacher = Class & Teacher;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: ClassId): Promise<ClassExtended> {
    return this.prisma.class.findUniqueOrThrow({
      where: { id },
      include: {
        sessions: {
          select: {
            id: true,
          },
        },
        teacher: { select: { id: true, name: true } },
        students: { select: { id: true, pseudonym: true } },
      },
    });
  }

  listClassesWithTeacher(
    args?: Omit<Prisma.ClassFindManyArgs, "select" | "include">,
  ): Promise<ClassWithTeacher[]> {
    return this.prisma.class.findMany({
      ...args,
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  create(klass: Prisma.ClassUncheckedCreateInput): Promise<Class> {
    const checkedClass: Prisma.ClassCreateInput = {
      name: klass.name,
      teacher: { connect: { id: klass.teacherId } },
    };
    return this.prisma.class.create({ data: checkedClass });
  }

  update(id: ClassId, klass: Prisma.ClassUpdateInput): Promise<Class> {
    return this.prisma.class.update({
      data: klass,
      where: { id },
    });
  }

  deleteById(id: ClassId): Promise<Class> {
    return this.prisma.class.delete({ where: { id } });
  }
}
