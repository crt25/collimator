import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";

/**
 * This class is an authentication strategy based on a Microsoft Entra ID login.
 */
@Injectable()
export class EntraIdStrategy extends PassportStrategy(
  BearerStrategy,
  "EntraId",
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("ENTRA_ID_SECRET"),
    });
  }

  validate(payload: unknown): unknown {
    return payload;
  }
}
