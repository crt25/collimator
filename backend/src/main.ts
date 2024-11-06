import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from "@nestjs/common";
import * as swagger from "./swagger";

async function bootstrap(): Promise<void> {
  const API_PREFIX = "api";
  const API_VERSIONS = ["0"];

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({
    defaultVersion: API_VERSIONS[API_VERSIONS.length - 1],
    type: VersioningType.URI,
  });

  swagger.setup(app, API_PREFIX, API_VERSIONS);

  await app.listen(3000);
}

bootstrap();
