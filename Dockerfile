# 使用 Node.js 基礎映像
FROM node:20-slim AS builder

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴
RUN npm install

# 複製其餘程式碼
COPY . .

# 如果有需要環境變數，可以在這裡設定
ENV VITE_APP_PASSWORD=5622230

# 執行打包 (Vite 會將結果輸出到 dist/)
RUN npm run build

# 使用輕量的 Nginx 來提供靜態檔案
FROM nginx:stable-alpine

# 自定義 Nginx 檔案以監聽 8080 端口 (Cloud Run 預設)
RUN sed -i 's/listen\( \+\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf

# 從 builder 階段複製打包好的靜態檔案
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 8080 端口
EXPOSE 8080

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
