import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- 全域變數宣告 ---
declare const __firebase_config: string;
declare const __app_id: string;

// ==========================================
// 🚀 若要部署到 Vercel 等平台，請將您的 Firebase 設定碼填入下方 🚀
// ==========================================
const myCustomFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// ==========================================

// --- 智慧判斷環境與資料庫初始化 ---
export const isDevEnv = typeof __firebase_config !== 'undefined';
const firebaseConfig = isDevEnv ? JSON.parse(__firebase_config) : myCustomFirebaseConfig;
const resolvedAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 根據環境自動決定資料庫儲存路徑
export const getCollectionPath = (colName: string) =>
  isDevEnv ? `artifacts/${resolvedAppId}/public/data/${colName}` : colName;
