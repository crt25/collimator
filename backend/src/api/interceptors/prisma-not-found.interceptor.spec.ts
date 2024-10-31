import {
  CallHandler,
  ExecutionContext,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { of, throwError } from "rxjs";
import { PrismaNotFoundInterceptor } from "./prisma-not-found.interceptor";

describe("PrismaNotFoundInterceptor", () => {
  let interceptor: PrismaNotFoundInterceptor;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new PrismaNotFoundInterceptor();
    context = {} as ExecutionContext;
    next = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it("should throw NotFoundException when Prisma not found error occurs", (done) => {
    const error = new Prisma.PrismaClientKnownRequestError("Error message", {
      code: "P2025",
      clientVersion: "2.0.0",
    });

    jest.spyOn(next, "handle").mockReturnValue(throwError(() => error));

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(NotFoundException);
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
