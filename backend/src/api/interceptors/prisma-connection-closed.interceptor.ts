import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

const Prisma_Server_Closed_Connection_ErrorCode = "P1017";

@Injectable()
export class PrismaConnectionClosedInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((err) =>
          throwError(() =>
            this.isPrismaNotFound(err)
              ? new InternalServerErrorException()
              : err,
          ),
        ),
      );
  }

  private isPrismaNotFound(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === Prisma_Server_Closed_Connection_ErrorCode
    );
  }
}
