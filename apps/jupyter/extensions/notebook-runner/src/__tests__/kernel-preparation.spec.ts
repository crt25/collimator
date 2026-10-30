import {
  resetKernelPreparation,
  setKernelIsPrepared,
  waitForKernelToBePrepared,
} from "../kernel/kernel-preparation";
import { createMockKernel } from "./helpers/kernel";

const reason = new Error("installing Otter failed");

describe("waitForKernelToBePrepared", () => {
  it("resolves once the kernel is prepared", async () => {
    const kernel = createMockKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });

  it("rejects with the reason if the kernel could not be prepared", async () => {
    const kernel = createMockKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    setKernelIsPrepared(kernel, false, reason);

    await expect(waiting).rejects.toBe(reason);
  });

  it("keeps rejecting for those who start waiting after the failure", async () => {
    const kernel = createMockKernel();

    // nobody is waiting yet
    setKernelIsPrepared(kernel, false, reason);

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(reason);
  });
});

describe("resetKernelPreparation", () => {
  it("reports the outcome of the next preparation after a failed one", async () => {
    const kernel = createMockKernel();
    setKernelIsPrepared(kernel, false, reason);

    resetKernelPreparation(kernel);
    const waiting = waitForKernelToBePrepared(kernel);
    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });

  it("reports the outcome of the next preparation after a successful one", async () => {
    const kernel = createMockKernel();
    setKernelIsPrepared(kernel);

    resetKernelPreparation(kernel);
    setKernelIsPrepared(kernel, false, reason);

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(reason);
  });

  it("keeps those already waiting informed if nothing was reported yet", async () => {
    const kernel = createMockKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    resetKernelPreparation(kernel);
    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });
});
