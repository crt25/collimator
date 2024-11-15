import {
  Body,
  Controller,
  Ip,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiForbiddenResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthenticationService, AuthToken } from "./authentication.service";
import { AuthenticationRequestDto } from "./dto/authentication-request.dto";
import { AuthenticationResponseDto } from "./dto/authentication-response.dto";
import { NonUserRoles, Public, Roles } from "./role.decorator";
import { StudentAuthenticationRequestDto } from "./dto/student-authentication-request.dto";
import { StudentAuthenticationResponseDto } from "./dto/student-authentication-response.dto";
import { AuthenticatedUser } from "./authenticated-user.decorator";
import { User, UserType } from "@prisma/client";
import { AuthorizationService } from "../authorization/authorization.service";

@Controller("authentication")
export class AuthenticationController {
  constructor(
    private authenticationService: AuthenticationService,
    private authorizatoinService: AuthorizationService,
  ) {}

  @Post("login")
  @Public()
  @ApiOkResponse({ type: AuthenticationResponseDto })
  @ApiForbiddenResponse()
  async login(
    @Body() authRequest: AuthenticationRequestDto,
  ): Promise<AuthenticationResponseDto> {
    const userAndToken = await this.authenticationService.signInUser(
      authRequest.idToken,
      authRequest.authenticationProvider,
    );

    return AuthenticationResponseDto.fromQueryResult(userAndToken);
  }

  @Post("login/student")
  @ApiOkResponse({ type: StudentAuthenticationResponseDto })
  @ApiForbiddenResponse()
  async loginStudent(
    @Body() request: StudentAuthenticationRequestDto,
    @AuthenticatedUser() user: User,
  ): Promise<StudentAuthenticationResponseDto> {
    const isAuthorized = await this.authorizatoinService.canSignInStudent(
      user,
      request.classId,
    );

    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    const authenticationToken = await this.authenticationService.signInStudent(
      request.pseudonym,
      request.classId,
      request.keyPairId,
    );

    return StudentAuthenticationResponseDto.fromQueryResult({
      authenticationToken,
    });
  }

  @Post("websocket-token")
  @Roles([UserType.TEACHER, UserType.ADMIN, NonUserRoles.STUDENT])
  @ApiOkResponse({ type: String })
  @ApiForbiddenResponse()
  async websocketToken(
    @AuthenticatedUser() auhenticatedUser: User,
    @Ip() ip: string,
  ): Promise<AuthToken> {
    const token =
      await this.authenticationService.issueWebsocketAuthenticationToken(
        auhenticatedUser,
        ip,
      );

    return token.token;
  }
}
