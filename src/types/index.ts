export interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string;
}

export interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  onConfirm: (() => void) | null;
}

export interface RecordFormData {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string;
}

export interface ColorPalette {
  bg: string;
  border: string;
  text: string;
  hoverBg: string;
  hoverBorder: string;
  timeText: string;
}
