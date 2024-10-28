import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SessionTasksService {
  constructor(protected prisma: PrismaService) {}

  async replaceTasks(sessionId: number, taskIds: number[]): Promise<void> {
    await this.prisma.sessionTask.deleteMany({
      where: { sessionId: sessionId },
    });

    await this.prisma.sessionTask.createMany({
      data: taskIds.map((taskId) => ({
        sessionId,
        taskId,
      })),
    });
  }
}
