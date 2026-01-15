
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const dbUrl = process.env.DATABASE_URL || '';
const hasTemplateMarkers = dbUrl.includes('${') || dbUrl.includes('POSTGRES_');

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: (dbUrl.includes('zeabur.internal') || dbUrl.includes('localhost')) 
       ? false 
       : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000 
});

app.use(cors() as any);
app.use(express.json() as any);

const initDb = async () => {
  console.log('--- 🛡️ 系統啟動檢查 ---');
  
  if (!dbUrl || hasTemplateMarkers) {
    console.error('❌ 錯誤: DATABASE_URL 未正確設定！');
    return;
  }

  let client;
  try {
    client = await pool.connect();
    
    // 檢查現有的資料表結構，如果 id 是 uuid 則刪除重建 (因為我們要換成 SERIAL)
    const checkIdType = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'check_ins' AND column_name = 'id';
    `);

    if (checkIdType.rowCount > 0 && checkIdType.rows[0].data_type === 'uuid') {
      console.log('⚠️ 偵測到舊版 UUID 結構，正在重置資料表以相容 SERIAL...');
      await client.query('DROP TABLE check_ins;');
    }
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id SERIAL PRIMARY KEY,
        nickname TEXT NOT NULL,
        day INTEGER NOT NULL,
        country_code TEXT NOT NULL,
        tags TEXT[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ 資料庫結構 check_ins 已就緒');
  } catch (err: any) {
    console.error('❌ 資料庫初始化失敗:', err.message);
  } finally {
    if (client) client.release();
  }
};

// --- API Routes ---

app.get('/api/health', async (req: any, res: any) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.json({ status: 'connected', db: 'ok' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/seed', async (req: any, res: any) => {
  const sampleData = [
    ['小明', 1, 'VN', ['authentic', 'wanna_more']],
    ['美食家', 1, 'JP', ['beautiful', 'stall']],
    ['張同學', 2, 'TH', ['authentic', 'value']],
    ['王小華', 2, 'FR', ['beautiful', 'service']],
    ['酷小子', 3, 'KR', ['wanna_more', 'stall']],
    ['旅人', 3, 'ID', ['value', 'authentic']],
    ['吃貨王', 1, 'VN', ['value', 'wanna_more']],
  ];

  try {
    for (const record of sampleData) {
      await pool.query(
        'INSERT INTO check_ins (nickname, day, country_code, tags) VALUES ($1, $2, $3, $4)',
        record
      );
    }
    res.json({ message: 'Success', count: sampleData.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

app.get('/api/checkins', async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM check_ins ORDER BY created_at DESC');
    res.json(result.rows.map(row => ({
      id: row.id.toString(),
      nickname: row.nickname,
      day: row.day,
      countryCode: row.country_code,
      tags: row.tags,
      timestamp: new Date(row.created_at).getTime()
    })));
  } catch (err: any) {
    res.status(500).json({ error: 'Fetch failed', details: err.message });
  }
});

app.post('/api/checkins', async (req: any, res: any) => {
  const { nickname, day, countryCode, tags } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO check_ins (nickname, day, country_code, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [nickname, day, countryCode, tags || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Save Error Details:', err);
    res.status(500).json({ 
      error: 'Save failed', 
      details: err.message,
      hint: err.hint || '請檢查資料庫權限或連線設定'
    });
  }
});

app.post('/api/analyze', async (req: any, res: any) => {
  const { records } = req.body;
  if (!process.env.API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `分析國際週美食紀錄：${JSON.stringify(records)}。請用繁體中文回報受歡迎國家、學生看重因素及明年建議。`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    res.json({ analysis: response.text });
  } catch (err: any) {
    res.status(500).json({ error: 'AI Error', details: err.message });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath) as any);

app.get('*', (req: any, res: any) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

initDb().finally(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
