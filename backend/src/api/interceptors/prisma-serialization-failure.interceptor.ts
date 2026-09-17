import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

const Prisma_Serialization_Failure_ErrorCode = "P2034";

@Injectable()
export class PrismaSerializationFailureInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((err) =>
          throwError(() =>
            this.isPrismaSerializationFailure(err)
              ? new ConflictException()
              : err,
          ),
        ),
      );
  }

  private isPrismaSerializationFailure(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === Prisma_Serialization_Failure_ErrorCode
    );
  }
}
