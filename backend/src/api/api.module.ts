import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { UsersModule } from "./users/users.module";
import * as filters from "./filters";

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: filters.PrismaNotFoundExceptionFilter,
    },
  ],
})
export class ApiModule {}
