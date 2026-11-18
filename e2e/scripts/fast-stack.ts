import {
  getFastSlot,
  getFastStackStatus,
  startFastStack,
  stopFastStack,
} from "../setup/fast-stack";

const main = async (): Promise<void> => {
  const command = process.argv[2];
  const slot = getFastSlot();

  switch (command) {
    case "start": {
      const state = await startFastStack(slot);
      console.log(
        `Fast stack ${slot} is running: frontend http://localhost:${state.frontendPort}, backend http://localhost:${state.backendPort}, database '${state.database}'`,
      );
      break;
    }
    case "stop":
      await stopFastStack(slot);
      console.log(`Fast stack ${slot} is stopped`);
      break;
    case "status": {
      const { state, isUsable } = await getFastStackStatus(slot);
      console.log(
        state
          ? `Fast stack ${slot} is ${isUsable ? "running" : "stale or not reachable (it is restarted on the next run)"}: ${JSON.stringify(state)}`
          : `Fast stack ${slot} is not running`,
      );
      break;
    }
    default:
      throw new Error("Usage: fast-stack.ts <start|stop|status>");
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
