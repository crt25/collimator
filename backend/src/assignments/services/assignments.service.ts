import { Injectable } from "@nestjs/common";
import { Assignment, Prisma } from "@prisma/client";
import { CreateAssignmentDto } from "../dto/create-assignment.dto";
import { UpdateAssignmentDto } from "../dto/update-assignment.dto";
import { RepositoryService } from "../../prisma/repository.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AssignmentsService extends RepositoryService<
  Assignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  Prisma.AssignmentWhereInput,
  Prisma.AssignmentWhereUniqueInput,
  Prisma.AssignmentOrderByWithRelationInput,
  Prisma.AssignmentCreateInput,
  Prisma.AssignmentUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma.assignment);
  }
}
