import { Module } from "@nestjs/common";
import { TasksModule } from "../tasks/tasks.module";
import { SolutionsModule } from "../solutions/solutions.module";
import { StudentActivityController } from "./student-activity.controller";
import { StudentActivityService } from "./student-activity.service";

@Module({
  imports: [TasksModule, SolutionsModule],
  controllers: [StudentActivityController],
  providers: [StudentActivityService],
  exports: [StudentActivityService],
})
export class StudentActivityModule {}
