import React from "react";
import type EditTaskModal from "@/components/modals/EditTaskModal";

type Props = React.ComponentProps<typeof EditTaskModal>;

// EditTaskModal embeds an external app in an iframe and communicates with it
// over an RPC channel. The real modal would wait for RPC responses that
// never arrive in jsdom. The mock bypasses the iframe entirely and calls
// onSave directly with a hardcoded payload, simulating a completed edit.
const EditTaskModalMock = ({ isShown, onSave, setIsShown }: Props) => {
  if (!isShown) {
    return null;
  }

  return (
    <div data-testid="mock-edit-task-modal">
      <button
        type="button"
        data-testid="mock-save-task-button"
        onClick={() => {
          onSave({
            file: new Blob(["task data"], { type: "application/json" }),
            initialSolution: {
              file: new Blob(["solution data"]),
              failedTests: [],
              passedTests: [
                { identifier: "test1", name: "Test 1", contextName: null },
              ],
            },
          });
        }}
      >
        Save Task
      </button>
      <button
        type="button"
        data-testid="mock-close-modal"
        onClick={() => setIsShown(false)}
      >
        Close
      </button>
    </div>
  );
};

export default EditTaskModalMock;
