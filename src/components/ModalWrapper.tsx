// components/ui/ModalWrapper.tsx
import React from "react";
import "./ModalWrapper.css";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
}: ModalWrapperProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title || "Modal"}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
