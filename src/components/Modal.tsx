import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
