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
import { TrackStudentActivityDto } from "./dto/track-activity.dto";

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
    type: TrackStudentActivityDto,
    description: "The activity to track",
  })
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @HttpCode(204)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "solution", maxCount: 1 }]),
    JsonToObjectsInterceptor(["appActivity"]),
  )
  async track(
    @AuthenticatedStudent() student: Student,
    @Body() trackActivityDto: TrackStudentActivityDto,
    @UploadedFiles()
    files: {
      solution?: Express.Multer.File[];
    },
  ): Promise<void> {
    const solutionFile = files.solution?.[0];

    if (!solutionFile) {
      throw new BadRequestException("Task file is required");
    }

    await this.studentActivityService.create(student, trackActivityDto, {
      data: solutionFile.buffer,
      mimeType: solutionFile.mimetype,
    });
  }
}
