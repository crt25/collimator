import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import {
  resetKernelPreparation,
  setKernelIsPrepared,
  waitForKernelToBePrepared,
} from "../kernel/kernel-preparation";

const createKernel = (): IKernelConnection => ({}) as IKernelConnection;

describe("waitForKernelToBePrepared", () => {
  it("resolves once the kernel is prepared", async () => {
    const kernel = createKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });

  it("rejects with the reason if the kernel could not be prepared", async () => {
    const kernel = createKernel();
    const reason = new Error("installing Otter failed");
    const waiting = waitForKernelToBePrepared(kernel);

    setKernelIsPrepared(kernel, false, reason);

    await expect(waiting).rejects.toBe(reason);
  });

  it("keeps rejecting for those who start waiting after the failure", async () => {
    const kernel = createKernel();
    const reason = new Error("installing Otter failed");

    // nobody is waiting yet
    setKernelIsPrepared(kernel, false, reason);

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(reason);
  });
});

describe("resetKernelPreparation", () => {
  it("reports the outcome of the next preparation after a failed one", async () => {
    const kernel = createKernel();
    setKernelIsPrepared(kernel, false, new Error("installing Otter failed"));

    resetKernelPreparation(kernel);
    const waiting = waitForKernelToBePrepared(kernel);
    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });

  it("reports the outcome of the next preparation after a successful one", async () => {
    const kernel = createKernel();
    const reason = new Error("installing Otter failed");
    setKernelIsPrepared(kernel);

    resetKernelPreparation(kernel);
    setKernelIsPrepared(kernel, false, reason);

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(reason);
  });

  it("keeps those already waiting informed if nothing was reported yet", async () => {
    const kernel = createKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    resetKernelPreparation(kernel);
    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });
});
