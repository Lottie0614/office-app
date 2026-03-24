import { useState, type FormEvent } from 'react';
import { Clock } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, getCollectionPath } from './services/firebase';
import { getLocalTodayString } from './utils/helpers';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFirebaseData } from './hooks/useFirebaseData';
import { useDialog } from './hooks/useDialog';
import type { RecordFormData } from './types';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import RecordForm from './components/RecordForm';
import EmployeeManager from './components/EmployeeManager';
import AbsenceModal from './components/AbsenceModal';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useFirebaseAuth();
  const { employees, absences } = useFirebaseData(user);
  const { dialog, showDialog, closeDialog } = useDialog();

  const [recordForm, setRecordForm] = useState<RecordFormData>({
    employeeId: '',
    date: getLocalTodayString(),
    startTime: '09:00',
    endTime: '18:00',
    note: ''
  });

  const handleAddAbsence = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!recordForm.employeeId || !recordForm.date || !recordForm.startTime || !recordForm.endTime) return;
    if (recordForm.startTime >= recordForm.endTime) {
      showDialog('alert', '時間設定錯誤', '結束時間必須大於開始時間！');
      return;
    }

    const newAbsence = { ...recordForm, id: Date.now().toString() };
    await setDoc(doc(db, getCollectionPath('absences'), newAbsence.id), newAbsence);

    setRecordForm({ ...recordForm, employeeId: '', note: '' });
    setIsModalOpen(false);

    const [year, month] = recordForm.date.split('-');
    setCurrentMonthDate(new Date(parseInt(year), parseInt(month) - 1, 1));
    setActiveTab('dashboard');
  };

  const handleDeleteAbsence = (id: string) => {
    if (!user) return;
    showDialog('confirm', '確認刪除', '確定要刪除這筆請假紀錄嗎？', async () => {
      await deleteDoc(doc(db, getCollectionPath('absences'), id));
    });
  };

  const handleOpenAbsenceModal = (dateStr: string) => {
    setRecordForm({ employeeId: '', date: dateStr, startTime: '09:00', endTime: '18:00', note: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <CalendarView
              employees={employees}
              absences={absences}
              currentMonthDate={currentMonthDate}
              setCurrentMonthDate={setCurrentMonthDate}
              onAddAbsence={handleOpenAbsenceModal}
              onDeleteAbsence={handleDeleteAbsence}
            />
          )}

          {activeTab === 'record' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-indigo-500" />
                登記人員請假
              </h2>
              <RecordForm
                recordForm={recordForm}
                setRecordForm={setRecordForm}
                employees={employees}
                onSubmit={handleAddAbsence}
              />
            </div>
          )}

          {activeTab === 'employees' && (
            <EmployeeManager
              user={user}
              employees={employees}
              absences={absences}
              showDialog={showDialog}
            />
          )}
        </div>
      </div>

      <AbsenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordForm={recordForm}
        setRecordForm={setRecordForm}
        employees={employees}
        onSubmit={handleAddAbsence}
      />

      <ConfirmDialog dialog={dialog} onClose={closeDialog} />
    </div>
  );
}