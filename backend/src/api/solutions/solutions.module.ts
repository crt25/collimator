import { Module } from "@nestjs/common";
import { SolutionsController } from "./solutions.controller";
import { SolutionsService } from "./solutions.service";
import { AuthenticationModule } from "../authentication/authentication.module";
import { AuthorizationModule } from "../authorization/authorization.module";

@Module({
  imports: [AuthenticationModule, AuthorizationModule],
  controllers: [SolutionsController],
  providers: [SolutionsService],
})
export class SolutionsModule {}
