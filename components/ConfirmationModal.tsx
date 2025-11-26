
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-6 pl-1">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-4 font-bold rounded-lg transition-colors text-white shadow-md text-sm ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
