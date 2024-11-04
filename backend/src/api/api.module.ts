import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import * as interceptors from "./interceptors";
import { UsersModule } from "./users/users.module";
import { ClassesModule } from "./classes/classes.module";

@Module({
  imports: [UsersModule, ClassesModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: interceptors.PrismaNotFoundInterceptor,
    },
  ],
})
export class ApiModule {}
