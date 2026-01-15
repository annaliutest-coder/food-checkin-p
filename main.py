import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import asyncpg
from datetime import datetime

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "")
pool: Optional[asyncpg.Pool] = None

class CheckInCreate(BaseModel):
    nickname: str
    day: int
    countryCode: str
    tags: List[str] = []

class CheckInResponse(BaseModel):
    id: str
    nickname: str
    day: int
    countryCode: str
    tags: List[str]
    timestamp: int

@app.on_event("startup")
async def startup():
    global pool
    print("--- 🛡️ 系統啟動檢查 ---")

    if not DATABASE_URL or "${" in DATABASE_URL:
        print("❌ 錯誤: DATABASE_URL 未正確設定！")
        return

    try:
        pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10,
            ssl="require" if "zeabur.internal" not in DATABASE_URL and "localhost" not in DATABASE_URL else None
        )

        async with pool.acquire() as conn:
            # 檢查並創建表
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS check_ins (
                    id SERIAL PRIMARY KEY,
                    nickname TEXT NOT NULL,
                    day INTEGER NOT NULL,
                    country_code TEXT NOT NULL,
                    tags TEXT[] NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

        print("✅ 資料庫結構 check_ins 已就緒")
    except Exception as e:
        print(f"❌ 資料庫初始化失敗: {e}")

@app.on_event("shutdown")
async def shutdown():
    global pool
    if pool:
        await pool.close()

@app.get("/api/health")
async def health_check():
    if not pool:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "connected", "db": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/checkins")
async def get_checkins():
    if not pool:
        raise HTTPException(status_code=500, detail="Database not connected")

    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM check_ins ORDER BY created_at DESC")
        return [
            {
                "id": str(row["id"]),
                "nickname": row["nickname"],
                "day": row["day"],
                "countryCode": row["country_code"],
                "tags": row["tags"],
                "timestamp": int(row["created_at"].timestamp() * 1000)
            }
            for row in rows
        ]

@app.post("/api/checkins")
async def create_checkin(checkin: CheckInCreate):
    if not pool:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "INSERT INTO check_ins (nickname, day, country_code, tags) VALUES ($1, $2, $3, $4) RETURNING *",
                checkin.nickname, checkin.day, checkin.countryCode, checkin.tags
            )
            return {
                "id": str(row["id"]),
                "nickname": row["nickname"],
                "day": row["day"],
                "country_code": row["country_code"],
                "tags": row["tags"]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/seed")
async def seed_data():
    if not pool:
        raise HTTPException(status_code=500, detail="Database not connected")

    sample_data = [
        ("小明", 1, "VN", ["authentic", "wanna_more"]),
        ("美食家", 1, "JP", ["beautiful", "stall"]),
        ("張同學", 2, "TH", ["authentic", "value"]),
        ("王小華", 2, "FR", ["beautiful", "service"]),
        ("酷小子", 3, "KR", ["wanna_more", "stall"]),
        ("旅人", 3, "ID", ["value", "authentic"]),
        ("吃貨王", 1, "VN", ["value", "wanna_more"]),
    ]

    async with pool.acquire() as conn:
        for record in sample_data:
            await conn.execute(
                "INSERT INTO check_ins (nickname, day, country_code, tags) VALUES ($1, $2, $3, $4)",
                *record
            )

    return {"message": "Success", "count": len(sample_data)}

# 靜態文件服務（前端）
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        return FileResponse("dist/index.html")
