import {
  CallHandler,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { of, throwError } from "rxjs";
import { PrismaConnectionClosedInterceptor } from "./prisma-connection-closed.interceptor";

describe("PrismaConnectionClosedInterceptor", () => {
  let interceptor: PrismaConnectionClosedInterceptor;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new PrismaConnectionClosedInterceptor();
    context = {} as ExecutionContext;
    next = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it("should throw InternalServerErrorException when Prisma not found error occurs", (done) => {
    const error = new Prisma.PrismaClientKnownRequestError("Error message", {
      code: "P1017",
      clientVersion: "2.0.0",
    });

    jest.spyOn(next, "handle").mockReturnValue(throwError(() => error));

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        done();
      },
    });
  });

  it("should pass through other errors", (done) => {
    const error = new Error("Other error");

    jest.spyOn(next, "handle").mockReturnValue(throwError(() => error));

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });

  it("should pass through successful responses", (done) => {
    const response = { data: "test" };

    jest.spyOn(next, "handle").mockReturnValue(of(response));

    interceptor.intercept(context, next).subscribe({
      next: (res) => {
        expect(res).toBe(response);
        done();
      },
    });
  });
});
