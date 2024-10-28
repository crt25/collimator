import { Injectable } from "@nestjs/common";
import { Prisma, Session } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { RepositoryService } from "src/prisma/repository.service";
import { CreateSessionDto } from "src/sessions/dto/create-session.dto";
import { UpdateSessionDto } from "src/sessions/dto/update-session.dto";

@Injectable()
export class SessionsService extends RepositoryService<
  Session,
  CreateSessionDto,
  UpdateSessionDto,
  Prisma.SessionWhereInput,
  Prisma.SessionWhereUniqueInput,
  Prisma.SessionInclude,
  Prisma.SessionOrderByWithRelationInput,
  Prisma.SessionCreateInput,
  Prisma.SessionUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma.session);
  }
}
