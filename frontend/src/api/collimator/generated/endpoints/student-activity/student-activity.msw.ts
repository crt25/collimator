/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { HttpResponse, delay, http } from "msw";

export const getStudentActivityControllerTrackV0MockHandler = (
  overrideResponse?:
    | void
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<void> | void),
) => {
  return http.post("*/api/v0/student-activity", async (info) => {
    await delay(1000);
    if (typeof overrideResponse === "function") {
      await overrideResponse(info);
    }
    return new HttpResponse(null, { status: 204 });
  });
};
export const getStudentActivityMock = () => [
  getStudentActivityControllerTrackV0MockHandler(),
];
