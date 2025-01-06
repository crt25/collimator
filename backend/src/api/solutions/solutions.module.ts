import { Module } from "@nestjs/common";
import { AstModule } from "src/ast/ast.module";
import { TasksModule } from "../tasks/tasks.module";
import { SolutionsController } from "./solutions.controller";
import { SolutionsService } from "./solutions.service";
import { SolutionAnalysisService } from "./solution-analysis.service";

@Module({
  imports: [TasksModule, AstModule],
  providers: [SolutionsService, SolutionAnalysisService],
  controllers: [SolutionsController],
})
export class SolutionsModule {}
