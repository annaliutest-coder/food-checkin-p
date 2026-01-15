# 第一階段：構建前端
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二階段：運行 Python 後端
FROM python:3.11-slim
WORKDIR /app

# 安裝 Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製後端程式碼
COPY main.py .

# 複製前端構建產物
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 3000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
