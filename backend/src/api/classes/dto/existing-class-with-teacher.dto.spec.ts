import { ExistingClassWithTeacherDto } from "./existing-class-with-teacher.dto";
import { ClassTeacherDto } from "./class-teacher.dto";

describe("ExistingClassWithTeacherDto", () => {
  const teacher = { id: 5, name: "Jerry Smith" };
  const klass = {
    id: 1,
    name: "Test Class",
    teacherId: 5,
    teacher: { ...teacher, spuriousField: 3 },
    deletedAt: null,
  };

  it("can be constructed", () => {
    const classDto = ExistingClassWithTeacherDto.fromQueryResult(klass);

    expect(classDto.id).toEqual(klass.id);
    expect(classDto.name).toEqual(klass.name);
    expect(classDto).not.toHaveProperty("teacherId");
    expect(classDto.teacher).toBeInstanceOf(ClassTeacherDto);
    expect(classDto.teacher).toEqual(teacher);
  });
});
