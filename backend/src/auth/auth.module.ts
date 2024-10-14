import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { EntraIdStrategy } from "./entraid.strategy";
import { UsersModule } from "../users/users.module";
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, EntraIdStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
