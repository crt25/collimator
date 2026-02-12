import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";

export enum ErrorCode {
  TASK_IN_USE_BY_LESSON_OR_CLASS_WITH_STUDENTS = "TASK_IN_USE_BY_LESSON_OR_CLASS_WITH_STUDENTS",
  TASK_IN_OTHER_USERS_LESSON = "TASK_IN_OTHER_USERS_LESSON",
  GENERIC_ERROR = "GENERIC_ERROR",
}

export class ErrorCodeDto {
  @ApiProperty({
    enum: ErrorCode,
    enumName: "ErrorCode",
    "x-enumNames": Object.keys(ErrorCode),
  })
  errorCode!: typeof ErrorCode;
}
