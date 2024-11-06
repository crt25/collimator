import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

const Prisma_NotFound_ErrorCode = "P2025";

@Injectable()
export class PrismaNotFoundInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((err) =>
          throwError(() =>
            this.isPrismaNotFound(err) ? new NotFoundException() : err,
          ),
        ),
      );
  }

  private isPrismaNotFound(error: unknown): boolean {
    return (
      // normal Prisma error
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === Prisma_NotFound_ErrorCode) ||
      // jestPrisma-thrown error, untyped
      (!!error &&
        typeof error == "object" &&
        "name" in error &&
        error.name === "NotFoundError" &&
        "code" in error &&
        error.code === Prisma_NotFound_ErrorCode &&
        "clientVersion" in error)
    );
  }
}
