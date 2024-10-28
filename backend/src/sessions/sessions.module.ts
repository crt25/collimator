import { Module } from "@nestjs/common";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "src/sessions/services/sessions.service";

@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
