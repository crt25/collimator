import { Module } from "@nestjs/common";
import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import { AuthenticationModule } from "../authentication/authentication.module";
import { AuthorizationModule } from "../authorization/authorization.module";

@Module({
  imports: [AuthenticationModule, AuthorizationModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
