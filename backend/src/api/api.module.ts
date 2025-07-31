import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";
import * as interceptors from "./interceptors";
import { UsersModule } from "./users/users.module";
import { ClassesModule } from "./classes/classes.module";
import { TasksModule } from "./tasks/tasks.module";
import { SessionsModule } from "./sessions/sessions.module";
import { SolutionsModule } from "./solutions/solutions.module";
import { AuthenticationModule } from "./authentication/authentication.module";
import { StudentActivityModule } from "./student-activity/student-activity.module";

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    ClassesModule,
    TasksModule,
    SessionsModule,
    SolutionsModule,
    StudentActivityModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: interceptors.PrismaNotFoundInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: interceptors.PrismaConnectionClosedInterceptor,
    },
    // global filter for Sentry *after* exception filters or interceptors which we don't want to catch
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class ApiModule {}
