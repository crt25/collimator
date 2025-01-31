import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiModule } from "src/api/api.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SentryModule } from "@sentry/nestjs/setup";
import { CoreModule } from "./core/core.module";
import { AstModule } from "./ast/ast.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    CoreModule,
    AstModule,
    ApiModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
