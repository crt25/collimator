import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ClassAssignmentsService {
  constructor(protected prisma: PrismaService) {}

  async replaceAssignments(
    classId: number,
    assignmentIds: number[],
  ): Promise<void> {
    await this.prisma.classAssignment.deleteMany({
      where: { classId: classId },
    });

    await this.prisma.classAssignment.createMany({
      data: assignmentIds.map((assignmentId) => ({
        classId,
        assignmentId,
      })),
    });
  }
}
