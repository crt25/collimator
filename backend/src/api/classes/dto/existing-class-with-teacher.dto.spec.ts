import { plainToInstance } from "class-transformer";
import { ExistingClassWithTeacherDto } from "./existing-class-with-teacher.dto";

describe("ExistingClassWithTeacherDto", () => {
  const klass = {
    id: 1,
    name: "Test Class",
    teacherId: 5,
    teacher: { id: 5, name: "Jerry Smith" },
  };

  it("can be constructed", () => {
    const classDto = plainToInstance(ExistingClassWithTeacherDto, klass);

    expect(classDto.id).toEqual(klass.id);
    expect(classDto.name).toEqual(klass.name);
    expect(classDto.teacherId).toBeUndefined();
    expect(classDto.teacher).toEqual(klass.teacher);
  });
});
