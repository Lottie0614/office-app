import { X, PlusCircle } from 'lucide-react';
import RecordForm from './RecordForm';
import type { FormEvent } from 'react';
import type { Employee, RecordFormData } from '../types';

interface AbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordForm: RecordFormData;
  setRecordForm: (form: RecordFormData) => void;
  employees: Employee[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export default function AbsenceModal({ isOpen, onClose, recordForm, setRecordForm, employees, onSubmit }: AbsenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2 text-indigo-500" />
            登記請假
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <RecordForm
            recordForm={recordForm}
            setRecordForm={setRecordForm}
            employees={employees}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
