/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskType } from "@/api/collimator/generated/models";
import { ConflictError } from "@/errors/api";
import { UserRole } from "@/types/user/user-role";
import TaskForm from "@/components/task/TaskForm";
import { toaster } from "@/components/Toaster";
import { renderWithProviders } from "@/__tests__/helpers/render-with-providers";

// useNavigationObserver calls useRouter() internally and registers listeners
// on router.events, window popstate, and window unhandledrejection. None of
// these exist in jsdom, so the real hook would crash.
jest.mock("@/utilities/navigation-observer", () => ({
  useNavigationObserver: jest.fn(() => jest.fn()),
}));

// The real toaster is a Chakra UI object whose .success/.error methods are not
// Jest mock functions, so assertions like toHaveBeenCalledWith would throw. Which is why we mock it.
jest.mock("@/components/Toaster", () => ({
  toaster: { success: jest.fn(), error: jest.fn() },
}));

// EditTaskModal embeds an external app in an iframe and communicates with it
// over an RPC channel. The real modal would wait for RPC responses that
// never arrive in jsdom. The mock bypasses the iframe entirely and calls
// onSave directly with a hardcoded payload, simulating a completed edit.
jest.mock("@/components/modals/EditTaskModal", () => ({
  __esModule: true,
  default: require("@/__tests__/mocks/components/EditTaskModal").default,
}));

const submitMessage = { id: "submit", defaultMessage: "Save" };

const withTaskFileValues = {
  title: "Existing Task",
  description: "Description",
  type: TaskType.SCRATCH,
  taskFile: new Blob(["task"]),
  isPublic: false,
  initialSolution: null,
  initialSolutionFile: null,
};

const selectType = async (
  user: ReturnType<typeof userEvent.setup>,
  type: TaskType,
) => {
  await user.click(screen.getByTestId("type"));
  await user.click(screen.getByTestId(`select-option-${type}`));
};

describe("TaskForm UI Interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Save button state", () => {
    it("should be disabled when form is clean (initial render)", () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const submitButton = screen.getByTestId("submit") as HTMLInputElement;
      expect(submitButton.disabled).toBe(true);
    });

    it("should be enabled when form becomes dirty", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const titleInput = screen.getByTestId("title") as HTMLInputElement;
      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      expect(submitButton.disabled).toBe(true);

      await user.type(titleInput, "Task Title");

      await waitFor(() => {
        expect(submitButton.disabled).toBe(false);
      });
    });

    it("should be disabled and show success toast after successful save", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
        />,
      );

      const submitButton = screen.getByTestId("submit") as HTMLInputElement;
      expect(submitButton.disabled).toBe(true);

      const titleInput = screen.getByTestId("title") as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      await waitFor(() => {
        expect(submitButton.disabled).toBe(false);
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(submitButton.disabled).toBe(true);
      });

      expect(toaster.success).toHaveBeenCalledWith(
        expect.objectContaining({ id: "task-save-success" }),
      );
    });
  });

  describe("Type change in create mode (no task file)", () => {
    it("should change type without confirmation modal when no task file exists", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      expect(screen.getByTestId("type")).toHaveTextContent("Scratch");

      await selectType(user, TaskType.JUPYTER);

      expect(
        screen.queryByTestId("confirmation-modal"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("type")).toHaveTextContent("Jupyter");

      const submitButton = screen.getByTestId("submit") as HTMLInputElement;
      expect(submitButton.disabled).toBe(false);
    });
  });

  describe("Type change in create mode (after task file was created via EditTaskModal)", () => {
    it("should show confirmation modal when changing type after task file was created", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      await user.click(screen.getByTestId("edit-task-button"));
      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("mock-save-task-button"));

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      expect(screen.getByTestId("type")).toHaveTextContent("Scratch");
    });

    it("should change type when confirming after task file was created", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      await user.click(screen.getByTestId("edit-task-button"));
      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("mock-save-task-button"));

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("confirm-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("type")).toHaveTextContent("Jupyter");
    });

    it("should not change type when canceling after task file was created", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      await user.click(screen.getByTestId("edit-task-button"));
      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("mock-save-task-button"));

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("cancel-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("type")).toHaveTextContent("Scratch");
    });
  });

  describe("Type change in edit mode (with task file)", () => {
    it("should show confirmation modal when changing type in edit mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      expect(screen.getByTestId("type")).toHaveTextContent("Scratch");
    });

    it("should change type when confirming type change in edit mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      const submitButton = screen.getByTestId("submit") as HTMLInputElement;
      expect(submitButton.disabled).toBe(true);

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("confirm-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("type")).toHaveTextContent("Jupyter");
      expect(submitButton.disabled).toBe(false);
    });

    it("should not change type when canceling type change confirmation", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("cancel-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("type")).toHaveTextContent("Scratch");
      expect(submitButton.disabled).toBe(true);
    });

    it("should pass clearAllReferenceSolutions=true to onSubmit after confirming type change", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      await selectType(user, TaskType.JUPYTER);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("confirm-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      // After type change taskFile is cleared, create a new one via EditTaskModal
      await user.click(screen.getByTestId("edit-task-button"));
      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("mock-save-task-button"));

      await user.click(screen.getByTestId("submit") as HTMLInputElement);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ clearAllReferenceSolutions: true }),
        );
      });
    });
  });

  describe("Creating task via EditTaskModal", () => {
    it("should create task and enable save button", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const editTaskButton = screen.getByTestId("edit-task-button");
      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      expect(submitButton.disabled).toBe(true);

      await user.click(editTaskButton);

      await waitFor(() => {
        expect(screen.getByTestId("mock-save-task-button")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("mock-save-task-button"));

      expect(
        screen.queryByTestId("mock-edit-task-modal"),
      ).not.toBeInTheDocument();

      await waitFor(() => {
        expect(submitButton.disabled).toBe(false);
      });
    });

    it("should change button label from create to edit after task is created", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const editTaskButton = screen.getByTestId("edit-task-button");

      expect(editTaskButton).toHaveTextContent(
        "Create task in external application",
      );

      await user.click(editTaskButton);
      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("mock-save-task-button"));

      await waitFor(() => {
        expect(editTaskButton).toHaveTextContent(
          "Edit task in external application",
        );
      });
    });

    it("should not update form when EditTaskModal is closed without saving", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const editTaskButton = screen.getByTestId("edit-task-button");
      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      await user.click(editTaskButton);

      await waitFor(() => {
        expect(screen.getByTestId("mock-close-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("mock-close-modal"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("mock-edit-task-modal"),
        ).not.toBeInTheDocument();
      });

      expect(editTaskButton).toHaveTextContent(
        "Create task in external application",
      );
      expect(submitButton.disabled).toBe(true);
    });
  });

  describe("Editing task file with reference solutions (hasReferenceSolutions=true)", () => {
    it("should show confirmation modal when clicking edit task button", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      await user.click(screen.getByTestId("edit-task-button"));

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId("mock-edit-task-modal"),
      ).not.toBeInTheDocument();
    });

    it("should open EditTaskModal after confirming file replacement", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      await user.click(screen.getByTestId("edit-task-button"));

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("confirm-button"));

      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });
    });

    it("should not open EditTaskModal when canceling file replacement", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      await user.click(screen.getByTestId("edit-task-button"));

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("cancel-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      expect(
        screen.queryByTestId("mock-edit-task-modal"),
      ).not.toBeInTheDocument();
    });

    it("should pass clearAllReferenceSolutions=true to onSubmit after confirming file replacement", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      await user.click(screen.getByTestId("edit-task-button"));

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("confirm-button"));

      await waitFor(() => {
        expect(screen.getByTestId("mock-edit-task-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("mock-save-task-button"));

      await user.click(screen.getByTestId("submit") as HTMLInputElement);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ clearAllReferenceSolutions: true }),
        );
      });
    });
  });

  describe("Making task public (admin only)", () => {
    it("should show confirmation modal when checking isPublic", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.admin },
      );

      const isPublicCheckbox = screen.getByTestId("isPublic");

      // Why we use not.toHaveAttribute("data-state", ...) instead of toBeChecked():
      // data-testid is placed on ChakraCheckbox.Root (a <label>), not on
      // HiddenInput (<input type="checkbox">). Putting it on HiddenInput does
      // not work because Zag.js renders that input with `defaultChecked`.
      //
      // Zag.js always writes the correct controlled state to Root as a `data-state` attribute ("checked" / "unchecked"), regardless
      // of what the uncontrolled DOM input holds. We therefore use not.toHaveAttribute("data-state", "checked") as the negation bypass which is the opposite of not.toBeChecked().
      expect(isPublicCheckbox).not.toHaveAttribute("data-state", "checked");

      await user.click(isPublicCheckbox);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      expect(isPublicCheckbox).not.toHaveAttribute("data-state", "checked");
    });

    it("should tick isPublic and enable save on confirm", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.admin },
      );

      const isPublicCheckbox = screen.getByTestId("isPublic");
      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      expect(submitButton.disabled).toBe(true);

      await user.click(isPublicCheckbox);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("confirm-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(isPublicCheckbox).not.toHaveAttribute("data-state", "unchecked");
      });
      expect(submitButton.disabled).toBe(false);
    });

    it("should leave isPublic unchecked and save disabled on cancel", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.admin },
      );

      const isPublicCheckbox = screen.getByTestId("isPublic");
      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      await user.click(isPublicCheckbox);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("cancel-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-modal"),
        ).not.toBeInTheDocument();
      });

      expect(isPublicCheckbox).not.toHaveAttribute("data-state", "checked");
      expect(submitButton.disabled).toBe(true);
    });

    it("should uncheck isPublic without showing a confirmation modal", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={{ ...withTaskFileValues, isPublic: true }}
        />,
        { role: UserRole.admin },
      );

      const isPublicCheckbox = screen.getByTestId("isPublic");
      const submitButton = screen.getByTestId("submit") as HTMLInputElement;

      expect(isPublicCheckbox).not.toHaveAttribute("data-state", "unchecked");

      await user.click(isPublicCheckbox);

      expect(
        screen.queryByTestId("confirmation-modal"),
      ).not.toBeInTheDocument();

      await waitFor(() => {
        expect(isPublicCheckbox).not.toHaveAttribute("data-state", "checked");
      });
      expect(submitButton.disabled).toBe(false);
    });

    it("should not show isPublic checkbox for non-admin users", () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.teacher },
      );

      expect(screen.queryByTestId("isPublic")).not.toBeInTheDocument();
    });
  });

  describe("Save with no task file", () => {
    it("should show error toast and not call onSubmit", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(null);
      jest.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={{
            title: "Task",
            description: "Description",
            type: TaskType.SCRATCH,
            taskFile: null,
            isPublic: false,
            initialSolution: null,
            initialSolutionFile: null,
          }}
        />,
      );

      const titleInput = screen.getByTestId("title") as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      await user.click(screen.getByTestId("submit") as HTMLInputElement);

      await waitFor(() => {
        expect(toaster.error).toHaveBeenCalledWith(
          expect.objectContaining({ id: "task-file-required" }),
        );
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Save errors", () => {
    it("should show conflict error toast and call onConflictError when ConflictError is thrown", async () => {
      const user = userEvent.setup();
      const onConflictError = jest.fn();
      const onSubmit = jest.fn().mockRejectedValue(new ConflictError());
      jest.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
          onConflictError={onConflictError}
        />,
      );

      const titleInput = screen.getByTestId("title") as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      await user.click(screen.getByTestId("submit") as HTMLInputElement);

      await waitFor(() => {
        expect(toaster.error).toHaveBeenCalledWith(
          expect.objectContaining({ id: "task-conflict-error" }),
        );
      });
      expect(onConflictError).toHaveBeenCalled();
      expect(toaster.success).not.toHaveBeenCalled();
    });

    it("should show generic error toast when an unexpected error is thrown", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockRejectedValue(new Error("Unexpected"));
      jest.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
        />,
      );

      const titleInput = screen.getByTestId("title") as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      await user.click(screen.getByTestId("submit") as HTMLInputElement);

      await waitFor(() => {
        expect(toaster.error).toHaveBeenCalledWith(
          expect.objectContaining({ id: "task-save-error" }),
        );
      });
      expect(toaster.success).not.toHaveBeenCalled();
    });
  });

  describe("Disabled form state", () => {
    it("should not render edit button or submit when disabled", () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          disabled={true}
        />,
      );

      expect(screen.queryByTestId("edit-task-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("submit")).not.toBeInTheDocument();
    });
  });
});
