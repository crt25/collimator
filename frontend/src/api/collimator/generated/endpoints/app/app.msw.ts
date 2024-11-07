/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { HttpResponse, delay, http } from "msw";

export const getAppControllerGetHelloV0MockHandler = (
  overrideResponse?:
    | void
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<void> | void),
) => {
  return http.get("*/api/v0", async (info) => {
    await delay(1000);
    if (typeof overrideResponse === "function") {
      await overrideResponse(info);
    }
    return new HttpResponse(null, { status: 200 });
  });
};
export const getAppMock = () => [getAppControllerGetHelloV0MockHandler()];
