import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { plainToInstance } from "class-transformer";
import { PrismaClient, User } from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { ClassesController } from "./classes.controller";
import { ClassesService, ClassExtended } from "./classes.service";
import {
  CreateClassDto,
  UpdateClassDto,
  ExistingClassDto,
  DeletedClassDto,
  ExistingClassExtendedDto,
  ExistingClassWithTeacherDto,
} from "./dto";
import { fromQueryResults } from "../helpers";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("ClassesController", () => {
  let controller: ClassesController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const adminUser: User = {
    id: 1,
    name: "Admin",
    email: "root@collimator.com",
    type: "ADMIN",
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      controllers: [ClassesController],
      providers: [
        ClassesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("can create a class", async () => {
    const dto: CreateClassDto = { name: "Test Class", teacherId: 33 };
    const createdClass = { id: 1, ...dto };
    prismaMock.class.create.mockResolvedValue(createdClass);

    const result = await controller.create(dto);

    expect(result).toEqual(plainToInstance(ExistingClassDto, createdClass));
    expect(prismaMock.class.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        teacher: { connect: { id: dto.teacherId } },
      },
    });
  });

  it("can update a class", async () => {
    const id = 3;
    const dto: UpdateClassDto = { name: "Updated Class", teacherId: 34 };
    const updatedClass = { id, ...dto };
    prismaMock.class.update.mockResolvedValue(updatedClass);

    const result = await controller.update(adminUser, id, dto);

    expect(result).toEqual(plainToInstance(ExistingClassDto, updatedClass));
    expect(prismaMock.class.update).toHaveBeenCalledWith({
      data: dto,
      where: { id },
    });
  });

  it("can delete a class", async () => {
    const id = 99;
    const deletedClass = { id, name: "Deleted Class", teacherId: 34 };
    prismaMock.class.delete.mockResolvedValue(deletedClass);

    const result = await controller.remove(adminUser, id);

    expect(result).toEqual(plainToInstance(DeletedClassDto, deletedClass));
    expect(prismaMock.class.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("can find an existing class", async () => {
    const klass: ClassExtended = {
      id: 1,
      name: "Test Class",
      sessions: [],
      teacherId: 33,
      teacher: { name: "Teacher" },
      students: [],
    };
    prismaMock.class.findUniqueOrThrow.mockResolvedValue(klass);

    const result = await controller.findOne(adminUser, 1);

    expect(result).toBeInstanceOf(ExistingClassExtendedDto);
    expect(result).toEqual(ExistingClassExtendedDto.fromQueryResult(klass));
    expect(prismaMock.class.findUniqueOrThrow).toHaveBeenCalledWith({
      include: {
        sessions: {
          select: { id: true },
        },
        teacher: {
          select: { id: true, name: true },
        },
        students: {
          select: { id: true, keyPairId: true, pseudonym: true },
        },
      },
      where: { id: 1 },
    });
  });

  it("should return not found for a non-existing class", async () => {
    prismaMock.class.findUniqueOrThrow.mockRejectedValue(
      new Error("Not found"),
    );

    const action = controller.findOne(adminUser, 999);
    await expect(action).rejects.toThrow("Not found");
  });

  it("can retrieve all classes", async () => {
    const classes = [
      {
        id: 1,
        name: "Test Class",
        teacherId: 5,
        teacher: { id: 5, name: "Jerry Smith" },
      },
      {
        id: 2,
        name: "Another Class",
        teacherId: 6,
        teacher: { id: 6, name: "Summer Smith" },
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(classes);

    const result = await controller.findAll(adminUser);

    expect(prismaMock.class.findMany).toHaveBeenCalledTimes(1);
    expect(Array.isArray(result)).toBe(true);
    expect(
      result.every((klass) => klass instanceof ExistingClassWithTeacherDto),
    ).toBe(true);
    expect(result).toEqual(
      fromQueryResults(ExistingClassWithTeacherDto, classes),
    );
  });

  it("can retrieve all classes for a specific teacher", async () => {
    const teacherId = 5;
    const classes = [
      {
        id: 1,
        name: "Test Class",
        teacherId: teacherId,
        teacher: { id: teacherId, name: "Jerry Smith" },
      },
      {
        id: 2,
        name: "Another Class",
        teacherId: teacherId,
        teacher: { id: teacherId, name: "Jerry Smith" },
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(classes);

    const result = await controller.findAll(adminUser, teacherId);

    expect(prismaMock.class.findMany).toHaveBeenCalledWith({
      where: { teacherId: teacherId },
      include: { teacher: { select: { id: true, name: true } } },
    });
    expect(Array.isArray(result)).toBe(true);
    expect(
      result.every((klass) => klass instanceof ExistingClassWithTeacherDto),
    ).toBe(true);
    expect(result).toEqual(
      fromQueryResults(ExistingClassWithTeacherDto, classes),
    );
  });
});
