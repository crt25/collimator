import { Session } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { ExistingSessionDto } from "./existing-session.dto";

export class DeletedSessionDto extends ExistingSessionDto {
  static fromQueryResult(data: Session): DeletedSessionDto {
    return plainToInstance(DeletedSessionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
