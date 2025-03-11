import { ExecutionContext, NestInterceptor } from "@nestjs/common";
import { CallHandler } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { JsonToObjectsInterceptor } from "./json-to-object-interceptor";

describe("JsonToObjectsInterceptor", () => {
  let interceptor: NestInterceptor;
  let context: ExecutionContext & HttpArgumentsHost;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new (JsonToObjectsInterceptor(["field1", "field2"]))();
    context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        body: {
          field1: '{"key":"value"}',
          field2: '{"key2":"value2"}',
          field3: "not a json string",
          field4: '{"not":"parsed"}',
        },
      }),
    } as unknown as ExecutionContext & HttpArgumentsHost;
    next = {
      handle: jest.fn().mockReturnValue({
        pipe: jest.fn(),
      }),
    };
  });

  it("should parse JSON fields in the request body", () => {
    interceptor.intercept(context, next);

    const request = context.switchToHttp().getRequest();
    expect(request.body.field1).toEqual({ key: "value" });
    expect(request.body.field2).toEqual({ key2: "value2" });
    expect(request.body.field3).toEqual("not a json string");
    expect(request.body.field4).toEqual('{"not":"parsed"}');
  });

  it("should call next.handle()", () => {
    interceptor.intercept(context, next);
    expect(next.handle).toHaveBeenCalled();
  });
});
