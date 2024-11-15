import { Module } from "@nestjs/common";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { APP_GUARD } from "@nestjs/core";
import { RoleGuard } from "./role.guard";
import { AuthorizationModule } from "../authorization/authorization.module";
import { AuthenticationGateway } from "./authentication.gateway";

@Module({
  imports: [AuthorizationModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    {
      // by default, the AdminGuard will be used to protect all routes
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    AuthenticationGateway,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
