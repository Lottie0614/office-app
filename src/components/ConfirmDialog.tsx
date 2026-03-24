import { AlertCircle } from 'lucide-react';
import type { DialogState } from '../types';

interface ConfirmDialogProps {
  dialog: DialogState;
  onClose: () => void;
}

export default function ConfirmDialog({ dialog, onClose }: ConfirmDialogProps) {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-6 flex items-start space-x-4">
          <div className={`p-2 rounded-full ${dialog.type === 'alert' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{dialog.title}</h3>
            <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{dialog.message}</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          {dialog.type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
            >
              取消
            </button>
          )}
          <button
            onClick={() => {
              if (dialog.onConfirm) dialog.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm ${dialog.type === 'alert' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {dialog.type === 'alert' ? '我知道了' : '確認刪除'}
          </button>
        </div>
      </div>
    </div>
  );
}
