import type { FormEvent } from 'react';
import type { Employee, RecordFormData } from '../types';

interface RecordFormProps {
  recordForm: RecordFormData;
  setRecordForm: (form: RecordFormData) => void;
  employees: Employee[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export default function RecordForm({ recordForm, setRecordForm, employees, onSubmit }: RecordFormProps) {
  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">請假人員 *</label>
          <select
            required
            value={recordForm.employeeId}
            onChange={(e) => setRecordForm({ ...recordForm, employeeId: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white"
          >
            <option value="" disabled>-- 請選擇人員 --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">日期 *</label>
          <input
            type="date"
            required
            value={recordForm.date}
            onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">開始時間 *</label>
            <input
              type="time"
              required
              value={recordForm.startTime}
              onChange={(e) => setRecordForm({ ...recordForm, startTime: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">結束時間 *</label>
            <input
              type="time"
              required
              value={recordForm.endTime}
              onChange={(e) => setRecordForm({ ...recordForm, endTime: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">備註說明</label>
          <textarea
            rows={3}
            value={recordForm.note}
            onChange={(e) => setRecordForm({ ...recordForm, note: e.target.value })}
            placeholder="請輸入請假原因或相關說明（選填）"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none"
          ></textarea>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
          >
            儲存紀錄
          </button>
        </div>
      </form>
    </div>
  );
}
