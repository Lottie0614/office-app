import { useState, useEffect, type FormEvent } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  UserPlus, 
  PlusCircle, 
  Trash2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Sparkles,
  Loader2,
  AlertCircle,
  Menu
} from 'lucide-react';

// --- Firebase 官方套件載入 ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// --- 全域變數宣告 ---
declare const __firebase_config: string;
declare const __app_id: string;
declare const __initial_auth_token: string;

// --- 型別定義 ---
interface Employee {
  id: string;
  name: string;
  department: string;
}

interface Absence {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string;
}

interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  onConfirm: (() => void) | null;
}

// --- 輔助函數 ---
const getLocalTodayString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

// --- Gemini API 整合設定 ---
const apiKey = ""; 
const callGeminiAPI = async (prompt: string, isJson = false, systemInstruction = "你是一個專業的人資助理。") => {
  if (!apiKey) {
    throw new Error("請先在程式碼中填入 Gemini API Key 才能使用 AI 功能");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const payload: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  if (isJson) {
    payload.generationConfig = { 
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          employeeId: { type: "STRING" },
          date: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          note: { type: "STRING" }
        },
        required: ["employeeId", "date", "startTime", "endTime"]
      }
    };
  }

  let retries = 3;
  let delay = 1000;
  while (retries > 0) {
    try {
      const res = await fetch(url, { 
        method: 'POST', 
        body: JSON.stringify(payload), 
        headers: { 'Content-Type': 'application/json' } 
      });
      if (!res.ok) throw new Error('API Request Failed');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return isJson ? JSON.parse(text) : text;
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};

// ==========================================
// 🚀 若要部署到 Vercel 等平台，請將您的 Firebase 設定碼填入下方 🚀
// ==========================================
const myCustomFirebaseConfig = {
  // apiKey: "填入您的API金鑰...",
  // authDomain: "您的專案名稱.firebaseapp.com",
  // projectId: "您的專案名稱",
  // storageBucket: "您的專案名稱.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "1:123456789:web:abcdefg"
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// ==========================================

// --- 智慧判斷環境與資料庫初始化 ---
const isDevEnv = typeof __firebase_config !== 'undefined';
const firebaseConfig = isDevEnv ? JSON.parse(__firebase_config) : myCustomFirebaseConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 根據環境自動決定資料庫儲存路徑
const getCollectionPath = (colName: string) => 
  isDevEnv ? `artifacts/${appId}/public/data/${colName}` : colName;

// --- 顏色調色盤 ---
const colorPalettes = [
  { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', hoverBg: 'hover:bg-indigo-100', hoverBorder: 'hover:border-indigo-200', timeText: 'text-indigo-500' },
  { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', hoverBg: 'hover:bg-rose-100', hoverBorder: 'hover:border-rose-200', timeText: 'text-rose-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', hoverBg: 'hover:bg-emerald-100', hoverBorder: 'hover:border-emerald-200', timeText: 'text-emerald-500' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', hoverBg: 'hover:bg-amber-100', hoverBorder: 'hover:border-amber-200', timeText: 'text-amber-500' },
  { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-800', hoverBg: 'hover:bg-sky-100', hoverBorder: 'hover:border-sky-200', timeText: 'text-sky-500' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', text: 'text-fuchsia-800', hoverBg: 'hover:bg-fuchsia-100', hoverBorder: 'hover:border-fuchsia-200', timeText: 'text-fuchsia-500' },
  { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-800', hoverBg: 'hover:bg-orange-100', hoverBorder: 'hover:border-orange-200', timeText: 'text-orange-500' },
  { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-800', hoverBg: 'hover:bg-teal-100', hoverBorder: 'hover:border-teal-200', timeText: 'text-teal-500' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // 新增：側邊選單收闔狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 自訂對話框狀態 ---
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });

  const showDialog = (type: 'confirm' | 'alert', title: string, message: string, onConfirm: (() => void) | null = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  // --- 表單狀態 ---
  const [recordForm, setRecordForm] = useState({
    employeeId: '',
    date: getLocalTodayString(),
    startTime: '09:00',
    endTime: '18:00',
    note: ''
  });
  
  const [empForm, setEmpForm] = useState({ name: '', department: '' });

  // AI 洞察報告狀態
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [insightResult, setInsightResult] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // --- 雲端資料綁定 & 認證 ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("登入失敗:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // 監聽雲端人員名單
    const empCol = collection(db, getCollectionPath('employees'));
    const unsubEmp = onSnapshot(empCol, (snapshot) => {
      setEmployees(snapshot.docs.map(d => d.data() as Employee));
    }, (err) => console.error(err));

    // 監聽雲端請假紀錄
    const absCol = collection(db, getCollectionPath('absences'));
    const unsubAbs = onSnapshot(absCol, (snapshot) => {
      setAbsences(snapshot.docs.map(d => d.data() as Absence)); 
    }, (err) => console.error(err));

    return () => { unsubEmp(); unsubAbs(); };
  }, [user]);

  // --- 處理函數 ---
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

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : '未知人員';
  };

  const getEmployeeColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colorPalettes.length;
    return colorPalettes[colorIndex];
  };

  // --- Gemini API 功能實作 ---
  const handleGenerateInsight = async () => {
    setIsInsightModalOpen(true);
    setIsInsightLoading(true);
    setInsightResult('');

    try {
      const currentMonthStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
      const currentMonthRecords = absences.filter(a => a.date.startsWith(currentMonthStr));
      
      const prompt = `
        請以繁體中文，用專業、精煉的人資主管角度，分析本月份 (${calendarYear}年${calendarMonth + 1}月) 的辦公室缺勤狀況。
        
        【資料背景】
        員工總名單：${JSON.stringify(employees)}
        本月請假紀錄：${JSON.stringify(currentMonthRecords)}
        
        【請提供以下分析，並適度加上 Emoji 排版】：
        1. 📊 本月總缺勤概況 (總請假天數/次數)
        2. 🏢 部門與人員觀察 (哪個部門或誰請假最頻繁？是否有集中在某些日子？)
        3. 💡 給管理層的營運小提醒 
      `;
      
      const textResult = await callGeminiAPI(prompt, false);
      setInsightResult(textResult);
    } catch {
      setInsightResult("生成洞察報告時發生錯誤，請稍後再試。如果您沒有填入 Gemini API Key，此功能將無法使用。");
    } finally {
      setIsInsightLoading(false);
    }
  };

  // --- 共用表單渲染函數 ---
  const renderRecordForm = () => (
    <div className="space-y-6">
      <form onSubmit={handleAddAbsence} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">請假人員 *</label>
          <select 
            required
            value={recordForm.employeeId}
            onChange={(e) => setRecordForm({...recordForm, employeeId: e.target.value})}
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
            onChange={(e) => setRecordForm({...recordForm, date: e.target.value})}
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
              onChange={(e) => setRecordForm({...recordForm, startTime: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">結束時間 *</label>
            <input 
              type="time" 
              required
              value={recordForm.endTime}
              onChange={(e) => setRecordForm({...recordForm, endTime: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">備註說明</label>
          <textarea 
            rows={3}
            value={recordForm.note}
            onChange={(e) => setRecordForm({...recordForm, note: e.target.value})}
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

  // --- 行事曆渲染邏輯 ---
  const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

  const calendarYear = currentMonthDate.getFullYear();
  const calendarMonth = currentMonthDate.getMonth();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const calendarGrids = Array(firstDayOfWeek).fill(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrids.push(i);

  const todayStr = getLocalTodayString();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-6 w-6" />
              <span className="text-xl font-bold tracking-wider">辦公室缺勤紀錄系統</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* 左側選單 */}
        <div className={`w-full ${isSidebarOpen ? 'md:w-64' : 'md:w-20'} flex-shrink-0 transition-all duration-300`}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            
            {/* 選單控制列 (結合到白色卡片中) */}
            <div className={`p-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-between md:justify-center'} border-b border-slate-100 bg-slate-50/50`}>
              <span className={`font-bold text-slate-700 tracking-wider ${isSidebarOpen ? 'block' : 'block md:hidden'}`}>系統選單</span>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="展開/收合選單"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* 選單項目 */}
            <div className={`${isSidebarOpen ? 'flex' : 'hidden md:flex'} flex-col`}>
              <button
                onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-6' : 'justify-center px-0'} py-4 transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium ml-3 whitespace-nowrap ${isSidebarOpen ? 'block' : 'hidden'}`}>請假行事曆</span>
              </button>
              <button
                onClick={() => { setActiveTab('record'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-6' : 'justify-center px-0'} py-4 transition-colors ${activeTab === 'record' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium ml-3 whitespace-nowrap ${isSidebarOpen ? 'block' : 'hidden'}`}>登記請假</span>
              </button>
              <button
                onClick={() => { setActiveTab('employees'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-6' : 'justify-center px-0'} py-4 transition-colors ${activeTab === 'employees' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <Users className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium ml-3 whitespace-nowrap ${isSidebarOpen ? 'block' : 'hidden'}`}>人員管理</span>
              </button>
            </div>
          </div>
        </div>

        {/* 右側主要內容區 */}
        <div className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300 flex flex-col">
              <div className="p-4 flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 bg-white gap-4 sm:gap-0">
                
                {/* 左側：AI 按鈕 (用來平衡兩側寬度，使中間 Datepicker 完美置中) */}
                <div className="hidden sm:flex flex-1 justify-start">
                  {apiKey && (
                    <button 
                      onClick={handleGenerateInsight}
                      className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      AI 缺勤分析
                    </button>
                  )}
                </div>

                {/* 中間：年月原生 Datepicker (絕對置中) */}
                <div className="flex-shrink-0 flex justify-center">
                  <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                      type="month"
                      value={`${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [y, m] = e.target.value.split('-');
                          setCurrentMonthDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                        }
                      }}
                      className="text-lg sm:text-xl font-bold text-slate-800 bg-transparent px-3 py-1.5 outline-none cursor-pointer w-[160px] sm:w-[180px] text-center"
                    />
                  </div>
                </div>

                {/* 右側：導覽按鈕 */}
                <div className="flex-1 flex justify-center sm:justify-end items-center space-x-2">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setCurrentMonthDate(new Date())} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-600 transition-colors">
                    回到今天
                  </button>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 手機版的 AI 按鈕保留不變 */}
              {apiKey && (
                <div className="p-3 border-b border-slate-100 sm:hidden bg-slate-50">
                    <button 
                      onClick={handleGenerateInsight}
                      className="w-full flex justify-center items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      AI 本月缺勤分析
                    </button>
                </div>
              )}

              <div className="grid grid-cols-7 border-l border-slate-100 bg-slate-50 flex-1">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 border-b border-r border-slate-100 bg-white">
                    {day}
                  </div>
                ))}
                
                {calendarGrids.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="min-h-[120px] border-b border-r border-slate-100 bg-slate-50/50"></div>;
                  
                  const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayRecords = absences.filter(a => a.date === dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <div key={`day-${day}`} className={`min-h-[120px] p-2 border-b border-r border-slate-100 transition-colors ${isToday ? 'bg-indigo-50/20' : 'bg-white hover:bg-slate-50/50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}>
                          {day}
                        </span>
                        <button
                          onClick={() => {
                            setRecordForm({ ...recordForm, date: dateStr, employeeId: '', note: '', startTime: '09:00', endTime: '18:00' });
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                          title="新增請假"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-1.5">
                        {dayRecords.map(record => {
                          const colors = getEmployeeColor(record.employeeId);
                          return (
                            <div key={record.id} title={record.note ? `備註：${record.note}` : '無備註'} className={`group relative ${colors.bg} border ${colors.border} rounded-md px-2 py-1.5 text-xs ${colors.text} shadow-sm flex flex-col transition-all ${colors.hoverBg} ${colors.hoverBorder}`}>
                              <span className="font-bold text-[13px]">{getEmployeeName(record.employeeId)}</span>
                              <span className={`text-[10px] ${colors.timeText} font-medium`}>{record.startTime} - {record.endTime}</span>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteAbsence(record.id); }} className="absolute top-1 right-1 p-1 bg-white/80 rounded-sm opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shadow-sm" title="刪除紀錄">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'record' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-indigo-500" />
                登記人員請假
              </h2>
              {renderRecordForm()}
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <UserPlus className="h-6 w-6 mr-2 text-indigo-500" />
                人員名單管理
              </h2>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">新增人員</h3>
                <form onSubmit={handleAddEmployee} className="flex flex-col md:flex-row gap-3">
                  <input type="text" placeholder="員工姓名 *" required value={empForm.name} onChange={(e) => setEmpForm({...empForm, name: e.target.value})} className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input type="text" placeholder="所屬部門 (選填)" value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})} className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
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
          )}
        </div>
      </div>

      {/* --- 登記請假彈出視窗 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2 text-indigo-500" />
                登記請假
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {renderRecordForm()}
            </div>
          </div>
        </div>
      )}

      {/* --- AI 洞察報告彈出視窗 --- */}
      {isInsightModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-purple-100">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                {calendarYear} 年 {calendarMonth + 1} 月缺勤分析
              </h3>
              <button onClick={() => setIsInsightModalOpen(false)} className="text-purple-400 hover:text-purple-700 transition-colors p-1 rounded-full hover:bg-purple-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] text-slate-700 leading-relaxed">
              {isInsightLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                  <p className="text-purple-600 font-medium">AI 正在仔細分析資料中，請稍候...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-medium">{insightResult}</div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsInsightModalOpen(false)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors">
                關閉報告
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 自訂對話框 --- */}
      {dialog.isOpen && (
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
                  onClick={closeDialog}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
                >
                  取消
                </button>
              )}
              <button 
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  closeDialog();
                }}
                className={`px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm ${dialog.type === 'alert' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {dialog.type === 'alert' ? '我知道了' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}