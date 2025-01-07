import VM from "scratch-vm";
import classNames from "classnames";
import icon from "../../extensions/assertions/test-icon-white.svg";
import { useAssertionsEnabled } from "../../hooks/useAssertionsEnabled";
import { useAssertionsState } from "../../hooks/useAssertionsState";
import styles from "./assertions-state.css";

const AssertionsState = ({ vm }: { vm: VM }) => {
  const assertionsEnabled = useAssertionsEnabled(vm);
  const assertionsState = useAssertionsState(vm);

  if (!assertionsEnabled) {
    return null;
  }

  const isSuccessful =
    assertionsState.total > 0 &&
    assertionsState.passed >= assertionsState.total;

  return (
    <div
      className={classNames(
        styles.state,
        isSuccessful ? styles.success : styles.noSuccess,
      )}
      data-testid="assertion-state"
    >
      {assertionsState.total > 0 && (
        <span>
          <span data-testid="passed">{assertionsState.passed}</span>
          {" / "}
          <span data-testid="total">{assertionsState.total}</span>
        </span>
      )}
      <img src={icon} />
    </div>
  );
};

export default AssertionsState;
