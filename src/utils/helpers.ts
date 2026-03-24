import { colorPalettes } from '../constants/colors';
import type { Employee } from '../types';

export const getLocalTodayString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export const getEmployeeName = (employees: Employee[], id: string) => {
  const emp = employees.find(e => e.id === id);
  return emp ? emp.name : '未知人員';
};

export const getEmployeeColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[colorIndex];
};
