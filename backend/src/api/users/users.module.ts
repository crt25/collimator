import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "src/api/users/users.service";
import { AuthenticationModule } from "../authentication/authentication.module";
import { AuthorizationModule } from "../authorization/authorization.module";

@Module({
  imports: [AuthenticationModule, AuthorizationModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
