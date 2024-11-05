import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle("Collimator")
    .setDescription("The Collimator API description")
    .setVersion("0.1")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

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

  await app.listen(3000);
}
bootstrap();
