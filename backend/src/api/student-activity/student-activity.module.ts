import { Module } from "@nestjs/common";
import { TasksModule } from "../tasks/tasks.module";
import { StudentActivityController } from "./student-activity.controller";
import { StudentActivityService } from "./student-activity.service";

@Module({
  imports: [TasksModule],
  controllers: [StudentActivityController],
  providers: [StudentActivityService],
  exports: [StudentActivityService],
})
export class StudentActivityModule {}
