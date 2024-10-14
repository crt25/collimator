import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { CoreModule } from "./core/core.module";
import { UsersModule } from "./users/users.module";
import { AstModule } from "./ast/ast.module";
import { DataAnalyzerModule } from "./data-analyzer/data-analyzer.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    CoreModule,
    UsersModule,
    AstModule,
    DataAnalyzerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
