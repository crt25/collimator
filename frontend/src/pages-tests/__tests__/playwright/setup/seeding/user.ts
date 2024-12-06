export const adminUser = {
  oidcSub: "1234",
  email: "jane@doe.com",
  name: "Jane Doe",
  type: "ADMIN" as const,
  authenticationProvider: "MICROSOFT" as const,
  passwords: ["hunter2", "toor"],
};

export const newTeacher = {
  oidcSub: "5678",
  email: "richard@feynman.com",
  name: "Richard Feynman",
  type: "TEACHER" as const,
  authenticationProvider: "MICROSOFT" as const,
  registrationToken: "123-456-789",
};

export const registeredUsers = [adminUser];
export const unregisteredUsers = [newTeacher];
