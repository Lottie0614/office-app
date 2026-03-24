import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Sparkles } from 'lucide-react';
import { geminiApiKey, callGeminiAPI } from '../services/geminiApi';
import { getEmployeeName, getEmployeeColor, getLocalTodayString } from '../utils/helpers';
import InsightModal from './InsightModal';
import type { Employee, Absence } from '../types';

interface CalendarViewProps {
  employees: Employee[];
  absences: Absence[];
  currentMonthDate: Date;
  setCurrentMonthDate: (date: Date) => void;
  onAddAbsence: (dateStr: string) => void;
  onDeleteAbsence: (id: string) => void;
}

export default function CalendarView({
  employees,
  absences,
  currentMonthDate,
  setCurrentMonthDate,
  onAddAbsence,
  onDeleteAbsence,
}: CalendarViewProps) {
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [insightResult, setInsightResult] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const calendarYear = currentMonthDate.getFullYear();
  const calendarMonth = currentMonthDate.getMonth();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const calendarGrids: (number | null)[] = Array(firstDayOfWeek).fill(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrids.push(i);

  const todayStr = getLocalTodayString();

  const prevMonth = () => setCurrentMonthDate(new Date(calendarYear, calendarMonth - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(calendarYear, calendarMonth + 1, 1));

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

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300 flex flex-col">
        {/* 頂部導覽列 */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 bg-white gap-4 sm:gap-0">
          <div className="hidden sm:flex flex-1 justify-start">
            {geminiApiKey && (
              <button
                onClick={handleGenerateInsight}
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                AI 缺勤分析
              </button>
            )}
          </div>

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

        {/* 手機版 AI 按鈕 */}
        {geminiApiKey && (
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

        {/* 行事曆格線 */}
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
                    onClick={() => onAddAbsence(dateStr)}
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
                        <span className="font-bold text-[13px]">{getEmployeeName(employees, record.employeeId)}</span>
                        <span className={`text-[10px] ${colors.timeText} font-medium`}>{record.startTime} - {record.endTime}</span>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteAbsence(record.id); }} className="absolute top-1 right-1 p-1 bg-white/80 rounded-sm opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shadow-sm" title="刪除紀錄">
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

      {/* AI 洞察報告彈出視窗 */}
      <InsightModal
        isOpen={isInsightModalOpen}
        onClose={() => setIsInsightModalOpen(false)}
        isLoading={isInsightLoading}
        result={insightResult}
        year={calendarYear}
        month={calendarMonth + 1}
      />
    </>
  );
}
