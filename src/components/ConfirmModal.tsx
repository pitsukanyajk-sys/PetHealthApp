import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const btnBg = type === 'danger' 
    ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md active:scale-95 transition-all' 
    : 'bg-amber-700 hover:bg-amber-800 text-white hover:shadow-md active:scale-95 transition-all';

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-amber-100/80 space-y-4">
        <div className="flex gap-3 items-start">
          <span className={`p-2.5 rounded-xl border shrink-0 ${
            type === 'danger' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-700'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </span>
          <div className="flex-1">
            <h4 className="font-bold text-lg text-stone-900">{title}</h4>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${btnBg} px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
