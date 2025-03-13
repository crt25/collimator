import { FormattedMessage } from "react-intl";
import styled from "@emotion/styled";
import { Fragment, useMemo } from "react";
import { Assertion } from "../types/scratch-vm-custom";
import Modal from "./modal/Modal";

const Badge = styled.div<{ passed: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);

  color: #fff;
  background-color: var(
    ${({ passed }) =>
      passed ? "--assertions-success-color" : "--assertions-failed-color"}
  );
`;

const Table = styled.table`
  width: 100%;
  margin-bottom: 1rem;

  th {
    text-align: left;
  }

  th:nth-of-type(1),
  td:nth-of-type(1) {
    width: 80%;
    hyphens: auto;
    word-break: break-all;
  }
`;

type RunAssertion = Assertion & { passed: boolean };
type AssertionsByTarget = { [target: string]: RunAssertion[] };

const groupByTarget = (
  byTarget: AssertionsByTarget,
  assertion: RunAssertion,
): AssertionsByTarget => {
  if (assertion.targetName in byTarget) {
    byTarget[assertion.targetName].push(assertion);
  } else {
    byTarget[assertion.targetName] = [assertion];
  }

  return byTarget;
};

const AssertionsModal = ({
  isShown,
  hideModal,
  passedAssertions,
  failedAssertions,
}: {
  isShown?: boolean;
  hideModal: () => void;
  passedAssertions: Assertion[];
  failedAssertions: Assertion[];
}) => {
  const passed = useMemo(
    () =>
      passedAssertions.map((a) => ({
        ...a,
        passed: true,
      })),
    [passedAssertions],
  );

  const failed = useMemo(
    () => failedAssertions.map((a) => ({ ...a, passed: false })),
    [failedAssertions],
  );

  const assertionsByTarget = useMemo(
    () =>
      [...passed, ...failed].reduce(
        groupByTarget,
        {} satisfies AssertionsByTarget,
      ),
    [passed, failed],
  );

  return (
    <Modal isShown={isShown} onHide={hideModal}>
      <h1>
        <FormattedMessage
          defaultMessage="Assertions"
          description="Heading of the assertions modal."
          id="crt.assertionsModal.heading"
        />
      </h1>

      {Object.entries(assertionsByTarget).map(([targetName, assertions]) => (
        <Fragment key={targetName}>
          <Table>
            <thead>
              <th>
                <FormattedMessage
                  defaultMessage="Assertion on {targetName}"
                  description="Heading of the assertion name column in the assertions modal."
                  id="crt.assertionsModal.tableAssertionNameHeading"
                  values={{
                    targetName,
                  }}
                />
              </th>
              <th>
                <FormattedMessage
                  defaultMessage="Status"
                  description="Heading of the assertion status column in the assertions modal."
                  id="crt.assertionsModal.tableAssertionStatusHeading"
                />
              </th>
            </thead>
            <tbody>
              {assertions.map((assertion) => (
                <tr key={assertion.blockId}>
                  <td>{assertion.assertionName}</td>
                  <td>
                    <Badge passed={assertion.passed}>
                      {assertion.passed ? (
                        <FormattedMessage
                          defaultMessage="Pass"
                          description="Indicator that a given assertion passed."
                          id="crt.assertionsModal.tableAssertionStatusPassed"
                        />
                      ) : (
                        <FormattedMessage
                          defaultMessage="Fail"
                          description="Indicator that a given assertion failed."
                          id="crt.assertionsModal.tableAssertionStatusFailed"
                        />
                      )}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Fragment>
      ))}

      <button onClick={hideModal}>
        <FormattedMessage
          defaultMessage="Close"
          id="crt.assertionsModal.close"
        />
      </button>
    </Modal>
  );
};

export default AssertionsModal;
