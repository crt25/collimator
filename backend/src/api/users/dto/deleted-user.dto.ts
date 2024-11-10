import { ExistingUserDto } from "./existing-user.dto";
import { User } from "@prisma/client";
import { plainToInstance } from "class-transformer";

export class DeletedUserDto extends ExistingUserDto {
  static fromQueryResult(data: User): ExistingUserDto {
    return plainToInstance(DeletedUserDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
