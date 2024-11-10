import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import * as interceptors from "./interceptors";
import { UsersModule } from "./users/users.module";
import { ClassesModule } from "./classes/classes.module";
import { TasksModule } from "./tasks/tasks.module";
import { SessionsModule } from "./sessions/sessions.module";
import { SolutionsModule } from "./solutions/solutions.module";

@Module({
  imports: [
    UsersModule,
    ClassesModule,
    TasksModule,
    SessionsModule,
    SolutionsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: interceptors.PrismaNotFoundInterceptor,
    },
  ],
})
export class ApiModule {}
