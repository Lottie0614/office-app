import { useState, useCallback } from 'react';
import type { DialogState } from '../types';

export function useDialog() {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });

  const showDialog = useCallback(
    (type: 'confirm' | 'alert', title: string, message: string, onConfirm: (() => void) | null = null) => {
      setDialog({ isOpen: true, type, title, message, onConfirm });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { dialog, showDialog, closeDialog };
}
