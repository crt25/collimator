import { ApiProperty } from "@nestjs/swagger";
import { RegistrationToken } from "@prisma/client";
import { Expose, plainToInstance } from "class-transformer";

export class RegistrationTokenDto implements Pick<RegistrationToken, "token"> {
  @ApiProperty({
    example: "2jbjd2ej23ikkjsdsd",
    description: "The registration token.",
    type: "string",
  })
  @Expose()
  token!: string;

  static fromQueryResult(data: RegistrationToken): RegistrationTokenDto {
    return plainToInstance(RegistrationTokenDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
