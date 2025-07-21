import { useCallback, useContext } from "react";
import VM from "scratch-vm";
import { connect } from "react-redux";

import ControlsComponent from "@scratch-submodule/scratch-gui/src/components/controls/controls.jsx";
import { CrtContext } from "../../contexts/CrtContext";

interface Props {
  isStarted: boolean;
  projectRunning: boolean;
  turbo: boolean;
  vm: VM;
}

const Controls = ({
  vm,
  isStarted,
  projectRunning,
  turbo,
  ...props
}: Props) => {
  const { sendRequest } = useContext(CrtContext);

  const handleGreenFlagClick = useCallback(
    async (e: MouseEvent) => {
      e.preventDefault();
      if (e.shiftKey) {
        vm.setTurboMode(!turbo);
      } else {
        if (!isStarted) {
          vm.start();
        }

        // do not wait for this request to succeed
        sendRequest(
          "postSolutionRun",
          new Blob([vm.toJSON()], {
            type: "application/json",
          }),
        );

        vm.greenFlag();
      }
    },
    [vm, isStarted, turbo],
  );

  const handleStopAllClick = useCallback(
    (e: Event) => {
      e.preventDefault();
      vm.stopAll();
    },
    [vm],
  );

  return (
    <ControlsComponent
      {...props}
      active={projectRunning}
      turbo={turbo}
      onGreenFlagClick={handleGreenFlagClick}
      onStopAllClick={handleStopAllClick}
    />
  );
};

interface ReduxState {
  scratchGui: {
    vmStatus: {
      running: boolean;
      turbo: boolean;
    };
  };
}

const mapStateToProps = (state: ReduxState) => ({
  isStarted: state.scratchGui.vmStatus.running,
  projectRunning: state.scratchGui.vmStatus.running,
  turbo: state.scratchGui.vmStatus.turbo,
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
