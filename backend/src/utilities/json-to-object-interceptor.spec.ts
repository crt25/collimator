import { ExecutionContext, NestInterceptor, CallHandler } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { JsonToObjectsInterceptor } from "./json-to-object-interceptor";

const body = {
  field1: '{"key":"value"}',
  field2: '{"key2":"value2"}',
  field3: "not {valid} [json]",
  field4: '{"not":"parsed"}',
};

describe("JsonToObjectsInterceptor", () => {
  let interceptor: NestInterceptor;
  let context: ExecutionContext & HttpArgumentsHost;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new (JsonToObjectsInterceptor(["field1", "field2"]))();
    context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        body: { ...body },
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
    expect(request.body).toEqual({
      field1: JSON.parse(body.field1),
      field2: JSON.parse(body.field2),
      field3: body.field3,
      field4: body.field4,
    });
  });

  it("should call next.handle()", () => {
    interceptor.intercept(context, next);
    expect(next.handle).toHaveBeenCalled();
  });
});
