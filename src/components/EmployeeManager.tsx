import { useState, type FormEvent } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, getCollectionPath } from '../services/firebase';
import type { User } from 'firebase/auth';
import type { Employee, Absence } from '../types';

interface EmployeeManagerProps {
  user: User | null;
  employees: Employee[];
  absences: Absence[];
  showDialog: (type: 'confirm' | 'alert', title: string, message: string, onConfirm: (() => void) | null) => void;
}

export default function EmployeeManager({ user, employees, absences, showDialog }: EmployeeManagerProps) {
  const [empForm, setEmpForm] = useState({ name: '', department: '' });

  const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !empForm.name.trim()) return;
    const newEmp = {
      id: Date.now().toString(),
      name: empForm.name,
      department: empForm.department || '未分類'
    };
    await setDoc(doc(db, getCollectionPath('employees'), newEmp.id), newEmp);
    setEmpForm({ name: '', department: '' });
  };

  const handleDeleteEmployee = (id: string) => {
    if (!user) return;
    const hasRecords = absences.some(a => a.employeeId === id);

    if (hasRecords) {
      showDialog('confirm', '刪除警告', '該人員已有請假紀錄！\n確定要移除人員，並「連同所有請假紀錄」一起刪除嗎？', async () => {
        await deleteDoc(doc(db, getCollectionPath('employees'), id));
        const userAbsences = absences.filter(a => a.employeeId === id);
        for (const abs of userAbsences) {
          await deleteDoc(doc(db, getCollectionPath('absences'), abs.id));
        }
      });
    } else {
      showDialog('confirm', '確認刪除', '確定要移除此人員嗎？', async () => {
        await deleteDoc(doc(db, getCollectionPath('employees'), id));
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <UserPlus className="h-6 w-6 mr-2 text-indigo-500" />
        人員名單管理
      </h2>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">新增人員</h3>
        <form onSubmit={handleAddEmployee} className="flex flex-col md:flex-row gap-3">
          <input type="text" placeholder="員工姓名 *" required value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input type="text" placeholder="所屬部門 (選填)" value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">新增</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow bg-white">
            <div>
              <div className="font-bold text-slate-800 text-lg">{emp.name}</div>
              <div className="text-sm text-slate-500">{emp.department}</div>
            </div>
            <button onClick={() => handleDeleteEmployee(emp.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="移除人員">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        {employees.length === 0 && <div className="col-span-full text-center py-8 text-slate-500">目前沒有任何人員資料</div>}
      </div>
    </div>
  );
}
