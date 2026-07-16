import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json());

// API route for analysis
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mimeType = file.mimetype;
    const base64Data = file.buffer.toString('base64');

    const prompt = `
請認真分析上傳的檔案內容（國考講義或試題），並針對其中涉及的國考核心爭點，以下列標準格式輸出「國考申論題擬答與整理」：

### 1. 核心爭點（Issue）
- 簡要說明本段內容在國考中最常出現的命題焦點（100字內）。

### 2. 國考標準擬答（Model Answer）
結構必須包含：
- **【一、 破題與大前提】**（明確指出涉及的法條與核心爭點，並給予傾向性結論）
- **【二、 本案爭點分析（小前提）】**：
  - **實務見解**：[精準列出相關的最高法院字號、大法官解釋或憲判字，並說明其核心要旨]
  - **學說見解**：[若有學說爭議，請用表格對比實務與學說之差異]
- **【三、 本案涵攝與結論】**（將題目事實帶入法條與實務見解，得出最終答案）

### 3. 記憶提取卡片（Anki 專用）
格式：[問題] \\t [答案（含💡 諸葛軍師小提示）]
（注意：請務必在問題與答案之間使用一個真正的 Tab 字元，或者用 \\t 表示，確保格式正確）

### 4. 考前衝刺 30 字口訣（TLDR）
- 用最精煉、好記的 3 句話（每句不超過 30 字）總結。
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      }
    });

    res.json({ analysis: result.text });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

setupServer();
