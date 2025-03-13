import React from "react";
import styles from "./modal.css";

const Modal = ({
  isShown,
  children,
  onHide,
}: {
  isShown?: boolean;
  onHide: () => void;
  children: React.ReactNode;
}) => {
  if (!isShown) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onHide} />
        {children}
      </div>
    </div>
  );
};

export default Modal;
