import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiModule } from "src/api/api.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SentryModule } from "@sentry/nestjs/setup";
import { CoreModule } from "./core/core.module";
import { AstModule } from "./ast/ast.module";
import { SentryService } from "./sentry.service";

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
    // The analysis cron jobs query the database every minute. During e2e tests
    // this collides with the per-test database reset (which drops the database
    // WITH (FORCE)), producing "P1017 Server has closed the connection" errors
    // and connection contention that makes page loads intermittently hang for
    // the full test timeout. The crons are not needed to exercise the UI, so
    // e2e starts the backend with DISABLE_SCHEDULED_TASKS=true to skip them.
    ...(process.env.DISABLE_SCHEDULED_TASKS === "true"
      ? []
      : [ScheduleModule.forRoot()]),
  ],
  providers: [SentryService],
})
export class AppModule {}
