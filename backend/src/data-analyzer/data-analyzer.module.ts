import { Module } from "@nestjs/common";
import { CriteriaBasedAnalyzerService } from "./criteria-based-analyzer.service";

@Module({
  providers: [CriteriaBasedAnalyzerService],
  exports: [CriteriaBasedAnalyzerService],
})
export class DataAnalyzerModule {}
