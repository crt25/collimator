import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
  mixin,
} from "@nestjs/common";

export function JsonToObjectsInterceptor(
  fields: string[],
): Type<NestInterceptor> {
  class JsonToObjectsInterceptorClass implements NestInterceptor {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    intercept(context: ExecutionContext, next: CallHandler) {
      const request = context.switchToHttp().getRequest();

      if (request.body) {
        fields.forEach((field) => {
          if (request.body[field]) {
            request.body[field] = JSON.parse(request.body[field]);
          }
        });
      }

      return next.handle();
    }
  }
  const Interceptor = mixin(JsonToObjectsInterceptorClass);
  return Interceptor as Type<NestInterceptor>;
}
