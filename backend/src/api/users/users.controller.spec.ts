import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { plainToInstance } from "class-transformer";
import {
  AuthenticationProvider,
  PrismaClient,
  User,
  UserType,
} from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { CreateUserDto, ExistingUserDto } from "./dto";

describe("UsersController", () => {
  let controller: UsersController;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let module: TestingModule;

  const adminUser: User = {
    id: 1,
    name: "Admin",
    email: "root@collimator.com",
    oidcSub: null,
    authenticationProvider: AuthenticationProvider.MICROSOFT,
    type: "ADMIN",
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("can create a user", async () => {
    const user = {
      name: "Alice",
      email: "alice@example.com",
      oidcSub: null,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
      type: UserType.TEACHER,
    };
    const createdUser = { ...user, id: 1 };
    prismaMock.user.create.mockResolvedValue(createdUser);

    const result = await controller.create(
      plainToInstance(CreateUserDto, user),
    );

    expect(result).toEqual(createdUser);
    expect(prismaMock.user.create).toHaveBeenCalledWith({ data: user });
  });

  it("can update a user", async () => {
    const user = {
      name: "Alice",
      email: "alice@example.com",
      oidcSub: null,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
      type: UserType.TEACHER,
    };
    const updatedUser = { ...user, id: 2 };
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await controller.update(
      adminUser,
      2,
      plainToInstance(CreateUserDto, user),
    );

    expect(result).toEqual(updatedUser);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: user,
      where: { id: 2 },
    });
  });

  it("can delete a user", async () => {
    const user = {
      id: 2,
      name: "Alice",
      email: "alice@example.com",
      oidcSub: null,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
      type: UserType.TEACHER,
    };
    prismaMock.user.delete.mockResolvedValue(user);

    const result = await controller.delete(user.id);

    expect(result).toEqual(plainToInstance(ExistingUserDto, user));
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });

  it("can find an existing user", async () => {
    const user = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      oidcSub: null,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
      type: UserType.TEACHER,
    };
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(user);

    const result = await controller.findOne(adminUser, user.id);

    expect(result).toBeInstanceOf(ExistingUserDto);
    expect(result).toEqual(user);
    expect(prismaMock.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });

  it("should return not found for a non-existing user", async () => {
    const user = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      oidcSub: null,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
      type: UserType.TEACHER,
    };
    prismaMock.user.findUniqueOrThrow.mockRejectedValue(new Error("Not found"));

    const action = controller.findOne(adminUser, user.id);
    await expect(action).rejects.toThrow("Not found");
  });

  it("can retrieve all users", async () => {
    const users = [
      {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        oidcSub: null,
        authenticationProvider: AuthenticationProvider.MICROSOFT,
        type: UserType.TEACHER,
      },
      {
        id: 2,
        name: "Bob",
        email: "bob@example.com",
        oidcSub: null,
        authenticationProvider: AuthenticationProvider.MICROSOFT,
        type: UserType.ADMIN,
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result.every((user) => user instanceof ExistingUserDto)).toBe(true);
    expect(result).toEqual(users);
  });
});
