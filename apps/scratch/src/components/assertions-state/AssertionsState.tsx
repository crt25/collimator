import VM from "scratch-vm";
import classNames from "classnames";
import { useState } from "react";
import icon from "../../extensions/assertions/test-icon-white.svg";
import { useAssertionsEnabled } from "../../hooks/useAssertionsEnabled";
import { useAssertionsState } from "../../hooks/useAssertionsState";
import AssertionsModal from "../AssertionsModal";
import styles from "./assertions-state.css";

const AssertionsState = ({ vm }: { vm: VM }) => {
  const assertionsEnabled = useAssertionsEnabled(vm);
  const { passedAssertions, failedAssertions } = useAssertionsState(vm);
  const [showModal, setShowModal] = useState(false);

  if (!assertionsEnabled) {
    return null;
  }

  const totalAssertionCount = failedAssertions.length + passedAssertions.length;

  const isSuccessful =
    passedAssertions.length > 0 && failedAssertions.length === 0;

  return (
    <>
      <button
        className={classNames(
          styles.state,
          isSuccessful ? styles.success : styles.noSuccess,
        )}
        onClick={() => setShowModal(true)}
        data-testid="assertion-state"
      >
        {totalAssertionCount > 0 && (
          <span>
            <span data-testid="passed">{passedAssertions.length}</span>
            {" / "}
            <span data-testid="total">{totalAssertionCount}</span>
          </span>
        )}
        <img src={icon} />
      </button>
      <AssertionsModal
        isShown={showModal}
        hideModal={() => setShowModal(false)}
        passedAssertions={passedAssertions}
        failedAssertions={failedAssertions}
      />
    </>
  );
};

export default AssertionsState;
