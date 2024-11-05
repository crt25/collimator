import { Prisma, UserType } from "@prisma/client";

export const defaultAdmin: Prisma.UserUncheckedCreateInput = {
  id: 101,
  name: "Admin User",
  email: "admin@example.com",
  type: UserType.ADMIN,
};

export const defaultTeacher: Prisma.UserUncheckedCreateInput = {
  id: 102,
  name: "Teacher User",
  email: "teacher@example.com",
  type: UserType.TEACHER,
};

export const users = [defaultAdmin, defaultTeacher];

export const classOne: Prisma.ClassUncheckedCreateInput = {
  id: 201,
  name: "Class One",
  teacherId: defaultTeacher.id!,
};

export const classTwo: Prisma.ClassUncheckedCreateInput = {
  id: 202,
  name: "Class Two",
  teacherId: defaultTeacher.id!,
};

export const classes = [classOne, classTwo];
