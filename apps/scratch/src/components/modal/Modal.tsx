import React from "react";
import styles from "./modal.css";

const Modal = ({
  isShown,
  children,
}: {
  isShown?: boolean;
  children: React.ReactNode;
}) => {
  if (!isShown) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>{children}</div>
    </div>
  );
};

export default Modal;
