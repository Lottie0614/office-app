import { X, Sparkles, Loader2 } from 'lucide-react';

interface InsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: string;
  year: number;
  month: number;
}

export default function InsightModal({ isOpen, onClose, isLoading, result, year, month }: InsightModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-purple-100">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-indigo-900 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
            {year} 年 {month} 月缺勤分析
          </h3>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-700 transition-colors p-1 rounded-full hover:bg-purple-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] text-slate-700 leading-relaxed">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
              <p className="text-purple-600 font-medium">AI 正在仔細分析資料中，請稍候...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap font-medium">{result}</div>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors">
            關閉報告
          </button>
        </div>
      </div>
    </div>
  );
}
