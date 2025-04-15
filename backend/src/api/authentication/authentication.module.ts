import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "src/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { AuthorizationModule } from "../authorization/authorization.module";
import { SessionsModule } from "../sessions/sessions.module";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { RoleGuard } from "./role.guard";
import { AuthenticationGateway } from "./authentication.gateway";

@Module({
  imports: [PrismaModule, ConfigModule, AuthorizationModule, SessionsModule],
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
