import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { plainToInstance } from "class-transformer";
import { PrismaClient, UserType } from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { CreateUserDto, ExistingUserDto } from "./dto";

describe("UsersController", () => {
  let controller: UsersController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
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

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("can create a user", async () => {
    const user = {
      name: "Alice",
      email: "alice@example.com",
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
      type: UserType.TEACHER,
    };
    const updatedUser = { ...user, id: 2 };
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await controller.update(
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
      type: UserType.TEACHER,
    };
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(user);

    const result = await controller.findOne(user.id);

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
      type: UserType.TEACHER,
    };
    prismaMock.user.findUniqueOrThrow.mockRejectedValue(new Error("Not found"));

    const action = controller.findOne(user.id);
    await expect(action).rejects.toThrow("Not found");
  });

  it("can retrieve all users", async () => {
    const users = [
      {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        type: UserType.TEACHER,
      },
      {
        id: 2,
        name: "Bob",
        email: "bob@example.com",
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
