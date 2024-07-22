# 使用官方 Node.js image 作為 base image
FROM node:latest

# 創建並設置 image 內的工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安装 depedencies
RUN npm install

# 複製當前目錄的所有文件件到工作目錄
COPY . .

# 暴露網頁運行的端口
EXPOSE 8000

# 定義啟動後的命令
CMD ["npm", "start"]
