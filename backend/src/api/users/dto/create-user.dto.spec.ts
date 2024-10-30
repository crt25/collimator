import { ArgumentMetadata, ValidationPipe } from "@nestjs/common";
import { UserType } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { CreateUserDto } from "./create-user.dto";

describe("CreateUserDto", () => {
  const user = {
    name: "Alice",
    email: "alice@example.com",
    type: UserType.TEACHER,
  };

  const target: ValidationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });

  const metadata: ArgumentMetadata = {
    type: "body",
    metatype: CreateUserDto,
    data: "",
  };

  it("can be constructed", () => {
    const userDto = plainToInstance(CreateUserDto, user);

    expect(userDto.name).toEqual(user.name);
    expect(userDto.email).toEqual(user.email);
    expect(userDto.type).toEqual(user.type);
  });

  it("validates valid DTO", async () => {
    await target.transform(<CreateUserDto>user, metadata).catch((err) => {
      console.log("Validation should succeed!");
      expect(err).toBe(undefined);
    });
  });

  it.each([
    ["name", ["name should not be empty", "name must be a string"]],
    ["email", ["email should not be empty", "email must be an email"]],
    [
      "type",
      [
        "type should not be empty",
        "type must be one of the following values: TEACHER, ADMIN",
      ],
    ],
  ])("validate DTO missing field (%s)", async (field, errors) => {
    await target
      .transform(<CreateUserDto>{ ...user, [field]: undefined }, metadata)
      .then(() => {
        console.log("Validation should fail!");
        expect(true).toBe(false);
      })
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toEqual(expect.arrayContaining(errors));
      });
  });

  it.each([
    ["name", 123, "name must be a string"],
    ["email", "not_an_email", "email must be an email"],
    [
      "type",
      "tomato",
      "type must be one of the following values: TEACHER, ADMIN",
    ],
  ])("validate DTO wrong field (%s)", async (field, value, error) => {
    await target
      .transform(<CreateUserDto>{ ...user, [field]: value }, metadata)
      .then(() => {
        console.log("Validation should fail!");
        expect(true).toBe(false);
      })
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toEqual([error]);
      });
  });
});
