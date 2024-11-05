import { plainToInstance } from "class-transformer";
import { ExistingClassExtendedDto } from "./existing-class-extended.dto";

describe("ExistingClassExtendedDto", () => {
  const klass = {
    id: 1,
    name: "Test Class",
    teacherId: 5,
    teacher: { id: 5, name: "Jerry Smith" },
    sessions: [{ id: 1 }, { id: 2 }],
    _count: { students: 25 },
  };

  it("can be constructed", () => {
    const classDto = plainToInstance(ExistingClassExtendedDto, klass);

    expect(classDto.id).toEqual(klass.id);
    expect(classDto.name).toEqual(klass.name);
    expect(classDto.teacherId).toBeUndefined();
    expect(classDto.teacher).toEqual(klass.teacher);
    expect(classDto.sessions).toEqual([1, 2]);
    expect(classDto.studentCount).toBe(25);
  });

  it("handles empty sessions", () => {
    const dto = plainToInstance(ExistingClassExtendedDto, {
      ...klass,
      sessions: [],
    });

    expect(dto.sessions).toEqual([]);
  });

  it("handles zero student count", () => {
    const dto = plainToInstance(ExistingClassExtendedDto, {
      ...klass,
      _count: { students: 0 },
    });

    expect(dto.studentCount).toBe(0);
  });

  it("handles undefined sessions", () => {
    const dto = plainToInstance(ExistingClassExtendedDto, {
      ...klass,
      sessions: undefined,
    });

    expect(dto.sessions).toEqual([]);
  });

  it("handles undefined student count", () => {
    const dto = plainToInstance(ExistingClassExtendedDto, {
      ...klass,
      _count: undefined,
    });

    expect(dto.studentCount).toBe(0);
  });
});
