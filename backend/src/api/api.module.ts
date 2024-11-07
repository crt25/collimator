import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import * as interceptors from "./interceptors";
import { UsersModule } from "./users/users.module";
import { ClassesModule } from "./classes/classes.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [UsersModule, ClassesModule, TasksModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: interceptors.PrismaNotFoundInterceptor,
    },
  ],
})
export class ApiModule {}
