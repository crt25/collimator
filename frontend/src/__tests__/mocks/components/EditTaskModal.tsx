import React from "react";
import type EditTaskModal from "@/components/modals/EditTaskModal";

type Props = React.ComponentProps<typeof EditTaskModal>;

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
