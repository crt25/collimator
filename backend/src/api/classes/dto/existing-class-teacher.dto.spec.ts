import { plainToInstance } from "class-transformer";
import { ExistingClassTeacherDto } from "./existing-class-teacher.dto";

describe("ExistingClassTeacherDto", () => {
  const klass = {
    id: 1,
    name: "Test Class",
    teacherId: 5,
    teacher: { id: 5, name: "Jerry Smith" },
  };

  it("can be constructed", () => {
    const classDto = plainToInstance(ExistingClassTeacherDto, klass);

    expect(classDto.id).toEqual(klass.id);
    expect(classDto.name).toEqual(klass.name);
    expect(classDto.teacherId).toBeUndefined();
    expect(classDto.teacher).toEqual(klass.teacher);
  });
});
