import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import * as swagger from "./swagger";
import { ConfigService } from "@nestjs/config";
import { createServer } from "http";

async function bootstrap(): Promise<void> {
  const API_PREFIX = "api";
  const API_VERSIONS = ["0"];

  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({
    defaultVersion: API_VERSIONS[API_VERSIONS.length - 1],
    type: VersioningType.URI,
  });

  swagger.setup(app, API_PREFIX, API_VERSIONS);

  // enable CORS for the frontend
  const frontendHostname = app
    .get(ConfigService)
    .get<string>("FRONTEND_HOSTNAME");

  app.enableCors({
    origin: frontendHostname,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    // ignore preflight requests
    preflightContinue: false,
    // we're not using cookies, so we don't need to send credentials
    credentials: false,
  });

  const stopPort = app.get(ConfigService).get<number>("STOP_PORT") ?? null;
  if (stopPort !== null) {
    const stopServer = createServer((_request, response) => {
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end();

      app.close();
      stopServer.close();
    }).listen(stopPort);
  }

  const port = app.get(ConfigService).get<number>("PORT") ?? 3000;
  await app.listen(port);
}

bootstrap();
