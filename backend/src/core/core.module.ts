import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";

// the core module is global - no need to explicitly import it, see https://docs.nestjs.com/modules#global-modules
@Global()
@Module({
  imports: [PrismaModule],
  exports: [PrismaModule],
})
export class CoreModule {}
