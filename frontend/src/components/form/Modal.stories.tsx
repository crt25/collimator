import { Modal } from "./Modal";

export default { component: Modal };

type Args = Parameters<typeof Modal>[0];

export const Default = {
  args: {
    title: "Confirm Action",
    description: "Are you sure you want to proceed with this action?",
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    onConfirm: () => console.log("Confirmed"),
    open: true,
    onOpenChange: () => {},
  } as Args,
};

export const Closed = {
  args: {
    title: "Confirm Action",
    description: "Are you sure you want to proceed with this action?",
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    onConfirm: () => console.log("Confirmed"),
    open: false,
    onOpenChange: () => {},
  } as Args,
};
