import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import "multer";
import { Student } from "@prisma/client";
import { JsonToObjectsInterceptor } from "src/utilities/json-to-object-interceptor";
import { AuthorizationService } from "../authorization/authorization.service";
import { StudentOnly } from "../authentication/role.decorator";
import { AuthenticatedStudent } from "../authentication/authenticated-student.decorator";
import { StudentActivityService } from "./student-activity.service";
import { TrackStudentActivitiesDto } from "./dto/track-activities.dto";

@Controller("student-activity")
@ApiTags("student-activity")
export class StudentActivityController {
  constructor(
    private readonly studentActivityService: StudentActivityService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post()
  @StudentOnly()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: TrackStudentActivitiesDto,
    description: "The activities to track",
  })
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @HttpCode(204)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "solutions" }]),
    JsonToObjectsInterceptor(["activities"]),
  )
  async track(
    @AuthenticatedStudent() student: Student,
    @Body() trackActivitiesDto: TrackStudentActivitiesDto,
    @UploadedFiles()
    files: {
      solutions?: Express.Multer.File[];
    },
  ): Promise<void> {
    const solutionFileCount = files.solutions?.length;

    if (
      files.solutions === undefined ||
      solutionFileCount !== trackActivitiesDto.activities.length
    ) {
      throw new BadRequestException(
        `The number of solution files (${solutionFileCount || 0}) does not match the number of activities (${trackActivitiesDto.activities.length}).`,
      );
    }

    await this.studentActivityService.createMany(
      student,
      trackActivitiesDto.activities.map((activity, index) => ({
        activity: activity,
        solution: {
          data: files.solutions![index].buffer,
          mimeType: files.solutions![index].mimetype,
        },
      })),
    );
  }
}
