import { DynamicModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

export const buildMockConfigModule = (
  config: Record<string, unknown>,
): Promise<DynamicModule> =>
  ConfigModule.forRoot({
    load: [(): Record<string, unknown> => config],
    ignoreEnvFile: true,
    ignoreEnvVars: true,
    isGlobal: true,
  });

export const mockConfigModule = buildMockConfigModule({
  OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID: "client-id",
  OPEN_ID_CONNECT_JWK_ENDPOINT: "https://jwk-endpoint",
});
