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
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((err) =>
          throwError(() =>
            this.isPrismaNotFound(err) ? new NotFoundException(err) : err,
          ),
        ),
      );
  }

  private isPrismaNotFound(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === Prisma_NotFound_ErrorCode
    );
  }
}
