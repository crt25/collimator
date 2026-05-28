import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";
import { TaskType } from "@/api/collimator/generated/models";
import { ConflictError } from "@/errors/api";
import { UserRole } from "@/types/user/user-role";
import TaskForm from "@/components/task/TaskForm";
import { toaster } from "@/components/Toaster";
import { renderWithProviders } from "@/__tests__/helpers/render-with-providers";
import { ignoreConsoleErrors } from "@/__tests__/helpers/ignore-console-errors";
import { TaskFormPageObject } from "./TaskForm.PageObject";

jest.mock("@/utilities/navigation-observer");
jest.mock("@/components/Toaster");
jest.mock("@/components/modals/EditTaskModal");

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

describe("TaskForm UI Interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Save button state", () => {
    it("should be disabled when form is clean (initial render)", () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();
      expect(form.submitButton.disabled).toBe(true);
    });

    it("should be enabled when form becomes dirty", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();
      expect(form.submitButton.disabled).toBe(true);

      await form.typeTitle("Task Title");

      await waitFor(() => {
        expect(form.submitButton.disabled).toBe(false);
      });
    });

    it("should be disabled and show success toast after successful save", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
        />,
      );

      const form = new TaskFormPageObject();
      expect(form.submitButton.disabled).toBe(true);

      await form.clearAndTypeTitle("Updated Title");

      await waitFor(() => {
        expect(form.submitButton.disabled).toBe(false);
      });

      await form.clickSubmit();

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(form.submitButton.disabled).toBe(true);
      });

      expect(toaster.success).toHaveBeenCalledWith(
        expect.objectContaining({ id: "task-save-success" }),
      );
    });

    it("should not call onSubmit when required fields are missing", async () => {
      const onSubmit = jest.fn();

      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={onSubmit} />,
      );

      const form = new TaskFormPageObject();

      // Typing only the title to make isDirty=true (enabling the button) while
      // leaving description empty, which fails Yup validation and prevents
      // handleSubmit from ever calling onSubmit.
      await form.typeTitle("Task Title");

      await waitFor(() => {
        expect(form.submitButton.disabled).toBe(false);
      });

      await form.clickSubmit();

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Type change in create mode (no task file)", () => {
    it("should change type without confirmation modal when no task file exists", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();
      expect(form.typeSelect).toHaveTextContent("Scratch");

      await form.selectType(TaskType.JUPYTER);

      expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      expect(form.typeSelect).toHaveTextContent("Jupyter");
      expect(form.submitButton.disabled).toBe(false);
    });
  });

  describe("Type change in create mode (after task file was created via EditTaskModal)", () => {
    it("should show confirmation modal when changing type after task file was created", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();
      expect(form.typeSelect).toHaveTextContent("Scratch");

      await form.clickEditTaskButton();
      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });
      await form.saveTaskInModal();

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      expect(form.typeSelect).toHaveTextContent("Scratch");
    });

    it("should change type when confirming after task file was created", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();
      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });
      await form.saveTaskInModal();

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.confirmModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      expect(form.typeSelect).toHaveTextContent("Jupyter");
    });

    it("should not change type when canceling after task file was created", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();
      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });
      await form.saveTaskInModal();

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.cancelModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      expect(form.typeSelect).toHaveTextContent("Scratch");
    });
  });

  describe("Type change in edit mode (with task file)", () => {
    it("should show confirmation modal when changing type in edit mode", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      const form = new TaskFormPageObject();

      expect(form.typeSelect).toHaveTextContent("Scratch");

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      expect(form.typeSelect).toHaveTextContent("Scratch");
    });

    it("should change type when confirming type change in edit mode", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      const form = new TaskFormPageObject();
      expect(form.submitButton.disabled).toBe(true);

      expect(form.typeSelect).toHaveTextContent("Scratch");

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.confirmModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      expect(form.typeSelect).toHaveTextContent("Jupyter");
      expect(form.submitButton.disabled).toBe(false);
    });

    it("should not change type when canceling type change confirmation", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      const form = new TaskFormPageObject();

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.cancelModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      expect(form.typeSelect).toHaveTextContent("Scratch");
      expect(form.submitButton.disabled).toBe(true);
    });

    it("should pass clearAllReferenceSolutions=true to onSubmit after confirming type change", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={false}
        />,
      );

      const form = new TaskFormPageObject();

      await form.selectType(TaskType.JUPYTER);

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.confirmModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      // After type change taskFile is cleared; create a new one via EditTaskModal
      await form.clickEditTaskButton();
      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });
      await form.saveTaskInModal();

      await form.clickSubmit();

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ clearAllReferenceSolutions: true }),
        );
      });
    });
  });

  describe("Creating task via EditTaskModal", () => {
    it("should create task and enable save button", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();
      expect(form.submitButton.disabled).toBe(true);

      await form.clickEditTaskButton();

      await waitFor(() => {
        expect(form.mockSaveTaskButton).toBeInTheDocument();
      });

      await form.saveTaskInModal();

      expect(form.queryMockEditTaskModal()).not.toBeInTheDocument();

      await waitFor(() => {
        expect(form.submitButton.disabled).toBe(false);
      });
    });

    it("should change button label from create to edit after task is created", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();
      expect(form.editTaskButton).toHaveTextContent(
        "Create task in external application",
      );

      await form.clickEditTaskButton();
      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });
      await form.saveTaskInModal();

      await waitFor(() => {
        expect(form.editTaskButton).toHaveTextContent(
          "Edit task in external application",
        );
      });
    });

    it("should not update form when EditTaskModal is closed without saving", async () => {
      renderWithProviders(
        <TaskForm submitMessage={submitMessage} onSubmit={jest.fn()} />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();

      await waitFor(() => {
        expect(form.mockCloseModal).toBeInTheDocument();
      });

      await form.closeTaskModal();

      await waitFor(() => {
        expect(form.queryMockEditTaskModal()).not.toBeInTheDocument();
      });

      expect(form.editTaskButton).toHaveTextContent(
        "Create task in external application",
      );
      expect(form.submitButton.disabled).toBe(true);
    });
  });

  describe("Editing task file with reference solutions (hasReferenceSolutions=true)", () => {
    it("should show confirmation modal when clicking edit task button", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      expect(form.queryMockEditTaskModal()).not.toBeInTheDocument();
    });

    it("should open EditTaskModal after confirming file replacement", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.confirmModal();

      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });
    });

    it("should not open EditTaskModal when canceling file replacement", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.cancelModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      expect(form.queryMockEditTaskModal()).not.toBeInTheDocument();
    });

    it("should pass clearAllReferenceSolutions=true to onSubmit after confirming file replacement", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
          hasReferenceSolutions={true}
        />,
      );

      const form = new TaskFormPageObject();

      await form.clickEditTaskButton();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.confirmModal();

      await waitFor(() => {
        expect(form.mockEditTaskModal).toBeInTheDocument();
      });

      await form.saveTaskInModal();
      await form.clickSubmit();

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ clearAllReferenceSolutions: true }),
        );
      });
    });
  });

  describe("Making task public (admin only)", () => {
    it("should show confirmation modal when checking isPublic", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.admin },
      );

      const form = new TaskFormPageObject();

      // Why we use not.toHaveAttribute("data-state", ...) instead of toBeChecked():
      // data-testid is placed on ChakraCheckbox.Root (a <label>), not on
      // HiddenInput (<input type="checkbox">). Putting it on HiddenInput does
      // not work because Zag.js renders that input with `defaultChecked`.
      //
      // Zag.js always writes the correct controlled state to Root as a `data-state` attribute ("checked" / "unchecked"), regardless
      // of what the uncontrolled DOM input holds. We therefore use not.toHaveAttribute("data-state", "checked") as the negation bypass which is the opposite of not.toBeChecked().
      expect(form.isPublic).not.toHaveAttribute("data-state", "checked");

      await form.clickIsPublic();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      expect(form.isPublic).not.toHaveAttribute("data-state", "checked");
    });

    it("should tick isPublic and enable save on confirm", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.admin },
      );

      const form = new TaskFormPageObject();
      expect(form.submitButton.disabled).toBe(true);

      await form.clickIsPublic();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.confirmModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(form.isPublic).not.toHaveAttribute("data-state", "unchecked");
      });
      expect(form.submitButton.disabled).toBe(false);
    });

    it("should leave isPublic unchecked and save disabled on cancel", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={withTaskFileValues}
        />,
        { role: UserRole.admin },
      );

      const form = new TaskFormPageObject();

      await form.clickIsPublic();

      await waitFor(() => {
        expect(form.confirmationModal).toBeInTheDocument();
      });

      await form.cancelModal();

      await waitFor(() => {
        expect(form.queryConfirmationModal()).not.toBeInTheDocument();
      });

      expect(form.isPublic).not.toHaveAttribute("data-state", "checked");
      expect(form.submitButton.disabled).toBe(true);
    });

    it("should uncheck isPublic without showing a confirmation modal", async () => {
      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={jest.fn()}
          initialValues={{ ...withTaskFileValues, isPublic: true }}
        />,
        { role: UserRole.admin },
      );

      const form = new TaskFormPageObject();
      expect(form.isPublic).not.toHaveAttribute("data-state", "unchecked");

      await form.clickIsPublic();

      expect(form.queryConfirmationModal()).not.toBeInTheDocument();

      await waitFor(() => {
        expect(form.isPublic).not.toHaveAttribute("data-state", "checked");
      });
      expect(form.submitButton.disabled).toBe(false);
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

      const form = new TaskFormPageObject();
      expect(form.queryIsPublic()).not.toBeInTheDocument();
    });
  });

  describe("Save with no task file", () => {
    it("should show error toast and not call onSubmit", async () => {
      const onSubmit = jest.fn().mockResolvedValue(null);
      ignoreConsoleErrors();

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

      const form = new TaskFormPageObject();
      await form.clearAndTypeTitle("Updated Title");
      await form.clickSubmit();

      await waitFor(() => {
        expect(toaster.error).toHaveBeenCalledWith(
          expect.objectContaining({ id: "task-file-required" }),
        );
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Save errors", () => {
    beforeEach(() => {
      ignoreConsoleErrors();
    });

    it("should show conflict error toast and call onConflictError when ConflictError is thrown", async () => {
      const onConflictError = jest.fn();
      const onSubmit = jest.fn().mockRejectedValue(new ConflictError());

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
          onConflictError={onConflictError}
        />,
      );

      const form = new TaskFormPageObject();
      await form.clearAndTypeTitle("Updated Title");
      await form.clickSubmit();

      await waitFor(() => {
        expect(toaster.error).toHaveBeenCalledWith(
          expect.objectContaining({ id: "task-conflict-error" }),
        );
      });
      expect(onConflictError).toHaveBeenCalled();
      expect(toaster.success).not.toHaveBeenCalled();
    });

    it("should show generic error toast when an unexpected error is thrown", async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error("Unexpected"));

      renderWithProviders(
        <TaskForm
          submitMessage={submitMessage}
          onSubmit={onSubmit}
          initialValues={withTaskFileValues}
        />,
      );

      const form = new TaskFormPageObject();
      await form.clearAndTypeTitle("Updated Title");
      await form.clickSubmit();

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

      const form = new TaskFormPageObject();
      expect(form.queryEditTaskButton()).not.toBeInTheDocument();
      expect(form.querySubmitButton()).not.toBeInTheDocument();
    });
  });
});
