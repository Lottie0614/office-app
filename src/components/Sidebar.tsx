import { Calendar as CalendarIcon, PlusCircle, Users, Menu } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const menuItems = [
  { key: 'dashboard', label: '請假行事曆', icon: CalendarIcon },
  { key: 'record', label: '登記請假', icon: PlusCircle },
  { key: 'employees', label: '人員管理', icon: Users },
];

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <div className={`w-full ${isSidebarOpen ? 'md:w-64' : 'md:w-20'} flex-shrink-0 transition-all duration-300`}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
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

        <div className={`${isSidebarOpen ? 'flex' : 'hidden md:flex'} flex-col`}>
          {menuItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-6' : 'justify-center px-0'} py-4 transition-colors ${activeTab === key ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className={`font-medium ml-3 whitespace-nowrap ${isSidebarOpen ? 'block' : 'hidden'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
