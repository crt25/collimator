import { Injectable } from "@nestjs/common";
import { AssignmentSubmission, Prisma } from "@prisma/client";
import { CreateAssignmentSubmissionDto } from "../dto/create-assignment-submission.dto";
import { UpdateAssignmentSubmissionDto } from "../dto/update-assignment-submission.dto";
import { RepositoryService } from "../../prisma/repository.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AssignmentSubmissionsService extends RepositoryService<
  AssignmentSubmission,
  CreateAssignmentSubmissionDto,
  UpdateAssignmentSubmissionDto,
  Prisma.AssignmentSubmissionWhereInput,
  Prisma.AssignmentSubmissionWhereUniqueInput,
  Prisma.AssignmentSubmissionOrderByWithRelationInput,
  Prisma.AssignmentSubmissionCreateInput,
  Prisma.AssignmentSubmissionUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma.assignmentSubmission);
  }
}
