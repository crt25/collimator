import { Module } from "@nestjs/common";
import { SolutionsController } from "./solutions.controller";
import { SolutionsService } from "./solutions.service";
import { AstModule } from "src/ast/ast.module";
import { TasksModule } from "../tasks/tasks.module";
import { SolutionAnalysisService } from "./solution-analysis.service";
import { DataAnalyzerModule } from "src/data-analyzer/data-analyzer.module";

@Module({
  imports: [TasksModule, AstModule, DataAnalyzerModule],
  providers: [SolutionsService, SolutionAnalysisService],
  controllers: [SolutionsController],
})
export class SolutionsModule {}
