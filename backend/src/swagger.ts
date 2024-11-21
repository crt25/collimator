import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";

export function setup(
  app: INestApplication,
  API_PREFIX: string,
  API_VERSIONS: string[],
): void {
  const config = new DocumentBuilder()
    .setTitle("Collimator")
    .setDescription("The Collimator API description (multi-version)")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(API_PREFIX, app, document, {
    explorer: true,
    swaggerOptions: {
      urls: API_VERSIONS.map((v) => ({
        name: `v${v}`,
        url: `/${API_PREFIX}/v${v}/swagger.json`,
      })),
    },
  });

  API_VERSIONS.forEach((version) => {
    const v = `v${version}`;

    const config = new DocumentBuilder()
      .setTitle("Collimator")
      .setDescription(`The Collimator API description (${v})`)
      .setVersion(version)
      .addBearerAuth()
      .addSecurityRequirements("bearer")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${API_PREFIX}/${v}`, app, document, {
      jsonDocumentUrl: `/${API_PREFIX}/${v}/swagger.json`,
      patchDocumentOnRequest: (req, _res, document) => {
        // NOTE: Make a deep copy of the original document,
        // or it will be modified on subsequent calls!
        const copyDocument = JSON.parse(JSON.stringify(document));
        for (const route in document.paths) {
          if (route.startsWith(`/${API_PREFIX}/${v}`)) {
            continue;
          }
          delete copyDocument.paths[route];
        }

        return copyDocument;
      },
    });
  });
}
