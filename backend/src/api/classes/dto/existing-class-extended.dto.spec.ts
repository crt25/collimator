import { Class, Student } from "@prisma/client";
import { ExistingClassExtendedDto } from "./existing-class-extended.dto";

describe("ExistingClassExtendedDto", () => {
  const klass = {
    id: 1,
    name: "Test Class",
    teacherId: 5,
    teacher: { id: 5, name: "Jerry Smith" },
    sessions: [{ id: 1 }, { id: 2 }],
    students: new Array(25).fill(undefined).map(
      (_, i) =>
        ({
          id: i + 1,
          pseudonym: Buffer.from(`Student ${i + 1}`, "utf-8"),
        }) as Student,
    ),
  };

  it("can be constructed", () => {
    const classDto = ExistingClassExtendedDto.fromQueryResult(klass);

    expect(classDto.id).toEqual(klass.id);
    expect(classDto.name).toEqual(klass.name);
    expect(classDto).not.toHaveProperty("teacherId");
    expect(classDto.teacher).toEqual(klass.teacher);
    expect(classDto.sessions).toEqual([1, 2]);
    expect(classDto.students.length).toBe(25);
  });

  it("handles empty sessions", () => {
    const dto = ExistingClassExtendedDto.fromQueryResult({
      ...klass,
      sessions: [],
    } as Class);

    expect(dto.sessions).toEqual([]);
  });

  it("handles zero student count", () => {
    const dto = ExistingClassExtendedDto.fromQueryResult({
      ...klass,
      students: [],
    } as Class);

    expect(dto.students.length).toBe(0);
  });

  it("handles undefined sessions", () => {
    const dto = ExistingClassExtendedDto.fromQueryResult({
      ...klass,
      sessions: undefined,
    } as Class);

    expect(dto.sessions).toEqual([]);
  });

  it("handles undefined student count", () => {
    const dto = ExistingClassExtendedDto.fromQueryResult({
      ...klass,
      students: undefined,
    } as Class);

    expect(dto.students.length).toBe(0);
  });
});
