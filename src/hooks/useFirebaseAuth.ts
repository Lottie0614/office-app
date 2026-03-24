import { useState, useEffect } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../services/firebase';

declare const __initial_auth_token: string;

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);

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

  return user;
}
