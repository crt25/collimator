import { AuthenticationProvider, UserType } from "@prisma/client";

export const defaultAdmin = {
  id: 101,
  name: "Admin User",
  email: "admin@example.com",
  oidcSub: null,
  authenticationProvider: AuthenticationProvider.MICROSOFT,
  type: UserType.ADMIN,
};

export const defaultTeacher = {
  id: 102,
  name: "Teacher User",
  email: "teacher@example.com",
  oidcSub: null,
  authenticationProvider: AuthenticationProvider.MICROSOFT,
  type: UserType.TEACHER,
};

export const users = [defaultAdmin, defaultTeacher];

export const classOne = {
  id: 201,
  name: "Class One",
  teacherId: defaultTeacher.id,
};

export const classTwo = {
  id: 202,
  name: "Class Two",
  teacherId: defaultTeacher.id,
};

export const classes = [classOne, classTwo];
