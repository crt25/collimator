import VM from "scratch-vm";
import styles from "./assertions-state.css";
import icon from "../../extensions/assertions/test-icon-white.svg";
import { useAssertionsEnabled } from "../../hooks/useAssertionsEnabled";
import { useAssertionsState } from "../../hooks/useAssertionsState";
import classNames from "classnames";

const AssertionsState = ({ vm }: { vm: VM }) => {
  const assertionsEnabled = useAssertionsEnabled(vm);
  const assertionsState = useAssertionsState(vm);

  if (!assertionsEnabled) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles.state,
        assertionsState.total > 0 &&
          assertionsState.passed >= assertionsState.total
          ? styles.success
          : styles.noSuccess,
      )}
    >
      {assertionsState.total > 0 && (
        <span>
          {assertionsState.passed} / {assertionsState.total}
        </span>
      )}
      <img src={icon} />
    </div>
  );
};

export default AssertionsState;
