import { Global, Module } from "@nestjs/common";
import { AuthenticationModule } from "src/api/authentication/authentication.module";
import { AuthorizationModule } from "src/api/authorization/authorization.module";
import { PrismaModule } from "src/prisma/prisma.module";

// the core module is global - no need to explicitly import it, see https://docs.nestjs.com/modules#global-modules
@Global()
@Module({
  imports: [PrismaModule, AuthenticationModule, AuthorizationModule],
  exports: [PrismaModule, AuthenticationModule, AuthorizationModule],
})
export class CoreModule {}
