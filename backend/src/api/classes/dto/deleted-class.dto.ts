import { Class } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { ExistingClassDto } from "./existing-class.dto";

export class DeletedClassDto extends ExistingClassDto {
  static fromQueryResult(data: Class): DeletedClassDto {
    return plainToInstance(DeletedClassDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
