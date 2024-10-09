import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { AssignmentsService } from "./services/assignments.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update-assignment.dto";
import { Assignment } from "@prisma/client";
import { ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { AssignmentEntity } from "../assignments/entities/assignment.entity";
import { CreateAssignmentDto } from "../assignments/dto/create-assignment.dto";
import { UpdateAssignmentDto } from "../assignments/dto/update-assignment.dto";

@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiCreatedResponse({ type: AssignmentEntity })
  async create(
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<AssignmentEntity> {
    return new AssignmentEntity(
      await this.assignmentsService.create(createAssignmentDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: AssignmentEntity, isArray: true })
  async findAll(): Promise<AssignmentEntity[]> {
    const assignments = await this.assignmentsService.findMany({});

    return assignments.map((assignment) => new AssignmentEntity(assignment));
  }

  @Get(":id")
  @ApiOkResponse({ type: AssignmentEntity })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AssignmentEntity | null> {
    const assignment = await this.assignmentsService.findUnique({ id });
    return assignment ? new AssignmentEntity(assignment) : null;
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: AssignmentEntity })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<AssignmentEntity> {
    return this.assignmentsService.update({
      where: { id: id },
      data: updateAssignmentDto,
    });
  }

  @Delete(":id")
  @ApiOkResponse({ type: AssignmentEntity })
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AssignmentEntity> {
    return new AssignmentEntity(await this.assignmentsService.delete({ id }));
  }
}
