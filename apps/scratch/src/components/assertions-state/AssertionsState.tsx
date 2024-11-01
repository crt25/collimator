import VM from "scratch-vm";
import styles from "./assertions-state.css";
import icon from "../../extensions/assertions/test-icon-white.svg";
import { useAssertionsEnabled } from "../../hooks/useAssertionsEnabled";
import { useAssertionsSatisfied } from "../../hooks/useAssertionsSatisfied";
import classNames from "classnames";

const AssertionsState = ({ vm }: { vm: VM }) => {
  const assertionsEnabled = useAssertionsEnabled(vm);
  const assertionsSatisfied = useAssertionsSatisfied(vm);

  if (!assertionsEnabled) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles.state,
        assertionsSatisfied ? styles.success : styles.noSuccess,
      )}
    >
      <img src={icon} />
    </div>
  );
};

export default AssertionsState;
