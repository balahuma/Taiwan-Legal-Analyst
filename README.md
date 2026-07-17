# 國考申論擬答分析器 (Legal Analyst v2.1)

專案網址：https://github.com/balahuma/Taiwan-Legal-Analyst

這是一個專為台灣國考（法律、行政等科目）設計的申論題分析與知識管理工具，基於 Google Gemini API 開發。

## 技術棧

React + TypeScript + Vite + Google Gemini API（套件管理使用 bun）

## 核心功能

- 社論美學欄位設計：提供舒適、低疲勞的閱讀體驗。
- AI 申論破題與分析：自動提取文件中的法律爭點，並產出「大前提、小前提、結論」三段論擬答。
- Anki 卡片自動生成：一鍵導出 Anki 格式 Tab 分隔檔。

## 快速開始

Step 1. Clone 專案：
git clone https://github.com/balahuma/Taiwan-Legal-Analyst.git
cd Taiwan-Legal-Analyst

Step 2. 安裝 bun（如果尚未安裝）：
npm install -g bun

Step 3. 安裝套件：
bun install

Step 4. 設定 API Key：
在專案根目錄建立 .env 檔案，內容為：
GEMINI_API_KEY=你的金鑰

Step 5. 啟動開發伺服器：
bun run dev

## 開發與協作指南

1. 本專案不包含任何 API Key。
2. 欲在本機運行或協作者，請至 Google AI Studio (https://aistudio.google.com/) 申請免費的 API Key。
3. 下載本專案後，依照上方「快速開始」步驟填入您的 API Key 即可啟動分析器。

## 想參與開發？

歡迎 Fork 本專案並送出 Pull Request，或開 Issue 討論想加入的功能。

## 免責聲明

本工具由 AI（Google Gemini）生成申論擬答與分析內容，僅供個人讀書與練習參考，不構成正式法律意見，也不保證考試結果。實際答題與法律判斷請以正式法規、教材及專業老師/律師意見為準。

## 授權

本專案採用 MIT License 授權，詳見 LICENSE 檔案。
