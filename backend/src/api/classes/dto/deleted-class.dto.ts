import { ExistingClassDto } from "./existing-class.dto";
import { Class } from "@prisma/client";
import { plainToInstance } from "class-transformer";

export class DeletedClassDto extends ExistingClassDto {
  static fromQueryResult(data: Class): DeletedClassDto {
    return plainToInstance(DeletedClassDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
