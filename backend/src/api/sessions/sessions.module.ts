import { Module } from "@nestjs/common";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";
import { AuthenticationModule } from "../authentication/authentication.module";
import { AuthorizationModule } from "../authorization/authorization.module";

@Module({
  imports: [AuthenticationModule, AuthorizationModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
