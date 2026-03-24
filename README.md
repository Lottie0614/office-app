# 辦公室缺勤紀錄系統

一個現代化的企業員工缺勤管理平台，提供直觀的行事曆檢視、AI 輔助分析，以及完整的人員與請假紀錄管理功能。

## 🔗 發布連結
- [線上版本](https://office-app-umber.vercel.app/) (Vercel 部署)

## 🎯 主要功能

### 📅 請假行事曆
- **月視圖行事曆** — 直觀檢視整月請假狀況
- **員工顏色編碼** — 每位員工自動分配獨特的顏色，快速識別
- **即時資料更新** — Firestore 雲端資料庫實時同步
- **一鍵記錄** — 點擊日期即可快速登記請假

### 📝 請假登記
- **靈活時間設定** — 支援整天、半天或特定時段請假
- **備註說明** — 填寫請假原因或特殊說明
- **表單驗證** — 自動檢查時間邏輯和必填項

### 👥 人員管理
- **快速新增員工** — 支援部門分類
- **批量操作** — 刪除員工時自動清除相關請假紀錄
- **冰河期提醒** — 刪除前確認員工是否有請假紀錄

### 🤖 AI 缺勤分析（Gemini 整合）
- **智能報告生成** — 自動分析月度缺勤趨勢
- **視覺化洞察** — 部門統計、高頻缺勤人員、異常日期識別
- **管理建議** — AI 提供營運相關的建議

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| **前端框架** | React 19 + TypeScript |
| **構建工具** | Vite |
| **样式層** | Tailwind CSS |
| **圖標庫** | Lucide React |
| **後端服務** | Firebase (Auth + Firestore) |
| **AI 服務** | Google Gemini API |

## 📦 專案結構

```
src/
├── types/
│   └── index.ts                 # 全域型別定義
├── services/
│   ├── firebase.ts              # Firebase 初始化、集合路徑管理
│   └── geminiApi.ts             # Gemini API 整合
├── constants/
│   └── colors.ts                # 員工顏色調色盤
├── utils/
│   └── helpers.ts               # 日期、名稱、顏色轉換函數
├── hooks/
│   ├── useFirebaseAuth.ts       # 認證狀態管理
│   ├── useFirebaseData.ts       # Firestore 即時資料訂閱
│   └── useDialog.ts             # 對話框狀態管理
├── components/
│   ├── Navbar.tsx               # 頂部導覽列
│   ├── Sidebar.tsx              # 側邊選單（支援展開/收合）
│   ├── CalendarView.tsx         # 行事曆檢視 + AI 分析按鈕
│   ├── RecordForm.tsx           # 請假表單（共用元件）
│   ├── EmployeeManager.tsx      # 人員管理頁面
│   ├── AbsenceModal.tsx         # 請假登記彈出視窗
│   ├── InsightModal.tsx         # AI 分析報告彈出視窗
│   └── ConfirmDialog.tsx        # 通用確認/警告對話框
└── App.tsx                      # 主應用組件（組合層）
```

### 架構特點

✅ **單一職責原則** — 每個模組只負責一件事  
✅ **模組化設計** — 易於測試、維護和擴展  
✅ **自訂 Hooks** — 共用邏輯提取為 Hooks  
✅ **元件隔離** — UI 元件無資料庫依賴，易於重用  

## 🚀 快速開始

### 前置要求

- **Node.js** ≥ 18.0.0
- **npm** 或 **pnpm**
- **Firebase 專案** (及其配置)
- **Gemini API Key** (可選，用於 AI 分析功能)

### 安裝

```bash
# 克隆專案
git clone <repository-url>
cd office-app

# 安裝依賴
npm install
# 或
pnpm install
```

### 環境變數配置

在項目根目錄建立 `.env.local` 檔案，填入 Firebase 和 Gemini 配置：

```env
# Firebase 配置
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API (可選)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 本地開發

```bash
# 啟動開發伺服器（預設 http://localhost:5173）
npm run dev
```

### 建構產品版本

```bash
# 編譯 TypeScript + 打包
npm run build

# 本地預覽產品構建
npm run preview
```

### 程式碼檢查

```bash
# 執行 ESLint 檢查
npm run lint
```

## 📋 使用說明

### 首次使用

1. **新增員工** — 進入「人員管理」頁面，填入員工姓名和部門
2. **記錄請假** — 在行事曆上點擊日期或使用「登記請假」頁面
3. **檢視統計** — 回到「請假行事曆」查看本月請假狀況
4. **生成報告** — 點擊 AI 缺勤分析按鈕生成月度報告

### 核心工作流

#### 工作流：登記請假
```
行事曆 → 點擊日期 → 填寫表單 → 選擇員工/時間/備註 → 儲存
```

#### 工作流：管理員工
```
人員管理 → 輸入名稱+部門 → 新增 → 管理/刪除
```

#### 工作流：生成分析報告
```
行事曆 → AI 缺勤分析 → 等待生成 → 檢視洞察報告
```

## 🔧 開發指南

### 新增功能

#### 示例：新增請假類型欄位

1. **更新型別** — `src/types/index.ts`
   ```typescript
   export interface Absence {
     id: string;
     employeeId: string;
     date: string;
     absenceType: 'sick' | 'vacation' | 'personal'; // 新增
     // ... 其他欄位
   }
   ```

2. **更新表單** — `src/components/RecordForm.tsx`
   ```typescript
   <select value={recordForm.absenceType} onChange={(e) => ...}>
     <option value="sick">病假</option>
     <option value="vacation">年假</option>
     <option value="personal">事假</option>
   </select>
   ```

3. **更新 Firebase 規則** — 在 Firestore 允許新欄位

### 習慣用語

- **狀態管理** — 使用 React Hooks (`useState`, `useCallback`)
- **副作用** — 用 `useEffect` 處理資料訂閱
- **樣式** — 用 Tailwind CSS utility classes
- **型別安全** — 總是使用 TypeScript 型別註解

### 檔案命名規範

- **元件** — PascalCase (如 `CalendarView.tsx`)
- **Hooks** — camelCase 前綴 `use` (如 `useFirebaseData.ts`)
- **工具函數** — camelCase (如 `helpers.ts`)
- **型別檔案** — `index.ts` (在 `types/` 或 `constants/`)

## 🌍 環境與部署

### 開發環境

- Firebase 使用 **開發模式** (限制讀寫)
- 支援匿名登入和自訂 Token 認證
- 資料儲存路徑：`employees` / `absences` 集合

### 生產環境

部署到 **Vercel** 或其他 Node.js 平台：

```bash
# 1. 環境變數設定
# 在部署平台設定 .env.local 中的所有變數

# 2. 建構
npm run build

# 3. 啟動
npm run preview
```

### Firebase 安全規則

在 Firestore 中設定規則以保護資料：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /employees/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.createdBy;
    }
    match /absences/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🐛 常見問題

### Q: 為什麼看不到 AI 分析按鈕？
**A:** 需要在 `src/services/geminiApi.ts` 中填入 Gemini API Key，或檢查環境變數 `VITE_GEMINI_API_KEY` 是否正確設定。

### Q: Firebase 資料同步延遲？
**A:** Firestore 通常在 1-2 秒內同步。若延遲超過 5 秒，請檢查網路連線和 Firebase 規則配置。

### Q: 如何備份資料？
**A:** 在 Firebase Console 中使用 Firestore 的「匯出」功能，選擇 `employees` 和 `absences` 集合。

## 📄 授權

本專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 檔案。

## 👨‍💻 貢獻

歡迎提交 Pull Request 或回報問題！

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📞 聯絡方式

如有問題或建議，請透過 GitHub Issues 聯繫。

---

**最後更新：** 2026 年 3 月  
**版本：** 1.0.0
