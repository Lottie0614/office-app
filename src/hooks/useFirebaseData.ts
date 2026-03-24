import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, getCollectionPath } from '../services/firebase';
import type { User } from 'firebase/auth';
import type { Employee, Absence } from '../types';

export function useFirebaseData(user: User | null) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);

  useEffect(() => {
    if (!user) return;

    const empCol = collection(db, getCollectionPath('employees'));
    const unsubEmp = onSnapshot(empCol, (snapshot) => {
      setEmployees(snapshot.docs.map(d => d.data() as Employee));
    }, (err) => console.error(err));

    const absCol = collection(db, getCollectionPath('absences'));
    const unsubAbs = onSnapshot(absCol, (snapshot) => {
      setAbsences(snapshot.docs.map(d => d.data() as Absence));
    }, (err) => console.error(err));

    return () => { unsubEmp(); unsubAbs(); };
  }, [user]);

  return { employees, absences };
}
