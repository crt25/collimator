import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CoreModule } from "./core/core.module";
import { AstModule } from "./ast/ast.module";
import { DataAnalyzerModule } from "./data-analyzer/data-analyzer.module";
import { ApiModule } from "src/api/api.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    CoreModule,
    AstModule,
    DataAnalyzerModule,
    ApiModule,
  ],
})
export class AppModule {}
