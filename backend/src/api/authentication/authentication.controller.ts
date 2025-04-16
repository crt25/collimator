import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiForbiddenResponse, ApiOkResponse } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { AuthorizationService } from "../authorization/authorization.service";
import { SessionsService } from "../sessions/sessions.service";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationRequestDto } from "./dto/authentication-request.dto";
import { AuthenticationResponseDto } from "./dto/authentication-response.dto";
import { Public } from "./role.decorator";
import { StudentAuthenticationRequestDto } from "./dto/student-authentication-request.dto";
import { StudentAuthenticationResponseDto } from "./dto/student-authentication-response.dto";
import { AuthenticatedUser } from "./authenticated-user.decorator";
import { PublicKeyDto } from "./dto/public-key.dto";
import { AnonymousStudentAuthenticationRequestDto } from "./dto/anonymous-student-authentication-request.dto";

@Controller("authentication")
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly authorizationService: AuthorizationService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Get("/public-key/:fingerprint")
  @Public()
  @ApiOkResponse({ type: PublicKeyDto })
  async findPublicKey(
    @Param("fingerprint") fingerprint: string,
  ): Promise<PublicKeyDto> {
    const key =
      await this.authenticationService.findPublicKeyByFingerprint(fingerprint);

    return PublicKeyDto.fromQueryResult(key);
  }

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
      authRequest.registrationToken,
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
    const isAuthorized = await this.authorizationService.canSignInStudent(
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

  @Post("login/student/anonymous")
  @ApiOkResponse({ type: StudentAuthenticationResponseDto })
  @ApiForbiddenResponse()
  @Public()
  async loginAnonymousStudent(
    @Body() request: AnonymousStudentAuthenticationRequestDto,
  ): Promise<StudentAuthenticationResponseDto> {
    const session = await this.sessionsService.findByIdAndClassOrThrow(
      request.sessionId,
      request.classId,
    );

    if (!session.isAnonymous) {
      throw new UnauthorizedException();
    }

    const authenticationToken =
      await this.authenticationService.signInAnonymousStudent(
        request.sessionId,
      );

    return StudentAuthenticationResponseDto.fromQueryResult({
      authenticationToken,
    });
  }
}
