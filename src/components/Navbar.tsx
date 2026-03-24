import { Calendar as CalendarIcon } from 'lucide-react';

export default function Navbar() {
  return (
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
  );
}
