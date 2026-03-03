import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { plainToInstance } from "class-transformer";
import { AuthenticationProvider, PrismaClient, User } from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { fromQueryResults } from "../helpers";
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

describe("ClassesController", () => {
  let controller: ClassesController;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let module: TestingModule;

  const adminUser: User = {
    id: 1,
    name: "Admin",
    email: "root@collimator.com",
    oidcSub: null,
    deletedAt: null,
    authenticationProvider: AuthenticationProvider.MICROSOFT,
    type: "ADMIN",
  };

  const teacherUser: User = {
    id: 2,
    name: "Teacher",
    email: "teacher@collimator.com",
    oidcSub: null,
    deletedAt: null,
    authenticationProvider: AuthenticationProvider.MICROSOFT,
    type: "TEACHER",
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    module = await Test.createTestingModule({
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

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("can create a class", async () => {
    const dto: CreateClassDto = { name: "Test Class", teacherId: 33 };
    const createdClass = { id: 1, ...dto, deletedAt: null };
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
    const updatedClass = { id, ...dto, deletedAt: null };
    prismaMock.class.update.mockResolvedValue(updatedClass);

    const result = await controller.update(adminUser, id, dto);

    expect(result).toEqual(plainToInstance(ExistingClassDto, updatedClass));
    expect(prismaMock.class.update).toHaveBeenCalledWith({
      data: dto,
      where: { id, deletedAt: null },
    });
  });

  it("can update a class excluding soft delete filter", async () => {
    const id = 3;
    const dto: UpdateClassDto = { name: "Updated Class", teacherId: 34 };
    const updatedClass = { id, ...dto, deletedAt: null };

    prismaMock.class.update.mockResolvedValue(updatedClass);

    const result = await controller.update(adminUser, id, dto, true);

    expect(result).toEqual(plainToInstance(ExistingClassDto, updatedClass));
    expect(prismaMock.class.update).toHaveBeenCalledWith({
      data: dto,
      where: { id },
    });
  });

  it("can delete a class", async () => {
    const id = 99;
    const deletedClass = {
      id,
      name: "Deleted Class",
      teacherId: 34,
      deletedAt: new Date(),
    };
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
      name: "Existing Class",
      sessions: [],
      teacherId: 33,
      teacher: { name: "Jerry Smith" },
      deletedAt: null,
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
          where: { deletedAt: null },
        },
        teacher: {
          select: { id: true, name: true },
        },
        students: {
          select: { studentId: true, keyPairId: true, pseudonym: true },
          where: { deletedAt: null },
        },
      },
      where: { id: 1, deletedAt: null },
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
        deletedAt: null,
      },
      {
        id: 2,
        name: "Another Class",
        teacherId: 6,
        teacher: { id: 6, name: "Summer Smith" },
        deletedAt: null,
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
        teacher: { id: teacherId, name: "Jerry Smith", deletedAt: null },
        deletedAt: null,
      },
      {
        id: 2,
        name: "Another Class",
        teacherId: teacherId,
        teacher: { id: teacherId, name: "Jerry Smith", deletedAt: null },
        deletedAt: null,
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(classes);

    const result = await controller.findAll(adminUser);

    expect(prismaMock.class.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, teacher: { deletedAt: null } },
      include: {
        teacher: { select: { id: true, name: true, deletedAt: true } },
      },
    });
    expect(Array.isArray(result)).toBe(true);
    expect(
      result.every((klass) => klass instanceof ExistingClassWithTeacherDto),
    ).toBe(true);
    expect(result).toEqual(
      fromQueryResults(ExistingClassWithTeacherDto, classes),
    );
  });

  it("should exclude soft-deleted classes when finding all classes by default", async () => {
    const classes = [
      {
        id: 1,
        name: "Existing Class",
        teacherId: 5,
        teacher: { id: 5, name: "Jerry Smith", deletedAt: null },
        deletedAt: null,
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(classes);

    await controller.findAll(adminUser);

    expect(prismaMock.class.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, teacher: { deletedAt: null } },
      include: {
        teacher: { select: { id: true, name: true, deletedAt: true } },
      },
    });
  });

  it("should include soft-deleted classes when includeSoftDelete is true in findAll", async () => {
    const allClasses = [
      {
        id: 1,
        name: "Existing Class",
        teacherId: 5,
        teacher: { id: 5, name: "Jerry Smith", deletedAt: null },
        deletedAt: null,
      },
      {
        id: 2,
        name: "Deleted Class",
        teacherId: 5,
        teacher: { id: 5, name: "Jerry Smith", deletedAt: new Date() },
        deletedAt: new Date(),
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(allClasses);

    const result = await controller.findAll(adminUser, true);

    expect(prismaMock.class.findMany).toHaveBeenCalledWith({
      where: { deletedAt: undefined },
      include: {
        teacher: { select: { id: true, name: true, deletedAt: true } },
      },
    });
    expect(result).toHaveLength(2);
  });

  it("should exclude soft-deleted related entities when finding a class by default", async () => {
    const klass: ClassExtended = {
      id: 1,
      name: "Existing Class",
      sessions: [{ id: 1 }],
      teacherId: 33,
      teacher: { name: "Jerry Smith" },
      deletedAt: null,
      students: [
        { studentId: 1, pseudonym: Buffer.from("test"), keyPairId: null },
      ],
    };
    prismaMock.class.findUniqueOrThrow.mockResolvedValue(klass);

    await controller.findOne(adminUser, 1);

    expect(prismaMock.class.findUniqueOrThrow).toHaveBeenCalledWith({
      include: {
        sessions: {
          select: { id: true },
          where: { deletedAt: null },
        },
        teacher: {
          select: { id: true, name: true },
        },
        students: {
          select: { studentId: true, keyPairId: true, pseudonym: true },
          where: { deletedAt: null },
        },
      },
      where: { id: 1, deletedAt: null },
    });
  });

  it("should include soft-deleted related entities when includeSoftDelete=true in findOne", async () => {
    const klass: ClassExtended = {
      id: 1,
      name: "Existing Class",
      sessions: [{ id: 1 }, { id: 2 }],
      teacherId: 33,
      teacher: { name: "Jerry Smith" },
      deletedAt: null,
      students: [
        { studentId: 1, pseudonym: Buffer.from("test1"), keyPairId: null },
        { studentId: 2, pseudonym: Buffer.from("test2"), keyPairId: null },
      ],
    };
    prismaMock.class.findUniqueOrThrow.mockResolvedValue(klass);

    await controller.findOne(adminUser, 1, true);

    expect(prismaMock.class.findUniqueOrThrow).toHaveBeenCalledWith({
      include: {
        sessions: {
          select: { id: true },
          where: undefined,
        },
        teacher: {
          select: { id: true, name: true },
        },
        students: {
          select: { studentId: true, keyPairId: true, pseudonym: true },
          where: undefined,
        },
      },
      where: { id: 1 },
    });
  });

  it("should perform soft delete when deleting a class", async () => {
    const id = 99;
    const softDeletedClass = {
      id,
      name: "Existing Class",
      teacherId: 34,
      deletedAt: new Date(),
    };

    prismaMock.class.delete.mockResolvedValue(softDeletedClass);

    const result = await controller.remove(adminUser, id);

    expect(result).toEqual(plainToInstance(DeletedClassDto, softDeletedClass));
    expect(prismaMock.class.delete).toHaveBeenCalledWith({
      where: { id },
    });
    expect(result.deletedAt).toEqual(softDeletedClass.deletedAt);
  });

  it("should be able to update a soft-deleted class when includeSoftDelete is true", async () => {
    const id = 3;
    const dto: UpdateClassDto = {
      name: "Updated Deleted Class",
      teacherId: 34,
    };
    const updatedClass = {
      id,
      ...dto,
      teacherId: 34,
      deletedAt: new Date(),
    };

    prismaMock.class.update.mockResolvedValue(updatedClass);

    const result = await controller.update(adminUser, id, dto, true);

    expect(result).toEqual(plainToInstance(ExistingClassDto, updatedClass));
    expect(prismaMock.class.update).toHaveBeenCalledWith({
      data: dto,
      where: { id },
    });
  });

  it("should filter by teacher and exclude soft-deleted classes by default", async () => {
    const activeClasses = [
      {
        id: 1,
        name: "Existing Class",
        teacherId: teacherUser.id,
        teacher: teacherUser,
        deletedAt: null,
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(activeClasses);

    await controller.findAll(teacherUser);

    expect(prismaMock.class.findMany).toHaveBeenCalledWith({
      where: {
        teacherId: teacherUser.id,
        deletedAt: null,
        teacher: { deletedAt: null },
      },
      include: {
        teacher: { select: { id: true, name: true, deletedAt: true } },
      },
    });
  });

  it("should filter by teacher and include soft-deleted classes when includeSoftDelete is true", async () => {
    const allClasses = [
      {
        id: 1,
        name: "Existing Class",
        teacherId: teacherUser.id,
        teacher: teacherUser,
        deletedAt: null,
      },
      {
        id: 2,
        name: "Deleted Class",
        teacherId: teacherUser.id,
        teacher: teacherUser,
        deletedAt: new Date(),
      },
    ];

    prismaMock.class.findMany.mockResolvedValue(allClasses);

    await controller.findAll(teacherUser, true);

    expect(prismaMock.class.findMany).toHaveBeenCalledWith({
      where: { teacherId: teacherUser.id, deletedAt: undefined },
      include: {
        teacher: { select: { id: true, name: true, deletedAt: true } },
      },
    });
  });

  it("should not find a soft-deleted class by default", async () => {
    prismaMock.class.findUniqueOrThrow.mockRejectedValue(
      new Error("Record not found"),
    );

    await expect(controller.findOne(adminUser, 999)).rejects.toThrow(
      "Record not found",
    );

    expect(prismaMock.class.findUniqueOrThrow).toHaveBeenCalledWith({
      include: {
        sessions: {
          select: { id: true },
          where: { deletedAt: null },
        },
        teacher: {
          select: { id: true, name: true },
        },
        students: {
          select: { studentId: true, keyPairId: true, pseudonym: true },
          where: { deletedAt: null },
        },
      },
      where: { id: 999, deletedAt: null },
    });
  });

  it("should find a soft-deleted class when includeSoftDelete is true", async () => {
    const softDeletedClass: ClassExtended = {
      id: 999,
      name: "Soft Deleted Class",
      sessions: [],
      teacherId: 33,
      teacher: { name: "Jerry Smith" },
      deletedAt: new Date(),
      students: [],
    };
    prismaMock.class.findUniqueOrThrow.mockResolvedValue(softDeletedClass);

    const result = await controller.findOne(adminUser, 999, true);

    expect(result).toBeInstanceOf(ExistingClassExtendedDto);
    expect(result.deletedAt).toEqual(softDeletedClass.deletedAt);
    expect(prismaMock.class.findUniqueOrThrow).toHaveBeenCalledWith({
      include: {
        sessions: {
          select: { id: true },
          where: undefined,
        },
        teacher: {
          select: { id: true, name: true },
        },
        students: {
          select: { studentId: true, keyPairId: true, pseudonym: true },
          where: undefined,
        },
      },
      where: { id: 999 },
    });
  });
});
