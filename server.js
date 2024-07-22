import express from "express";
import AWS from "aws-sdk";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { insertTable, showTable } from "./mysqldb.js";
dotenv.config();

// 設置 __dirname 和 __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, CDN_URL } = process.env;
const app = express();
const port = 8000;

// 設置靜態文件夾
app.use(express.static(path.join(__dirname, "public")));

// 使用中間件解析 JSON 和 URL-encoded 請求體數據
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 設置 Multer 存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 設置 AWS 配置
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: "us-east-1",
});

const s3 = new AWS.S3();
const folderName = "messageBoard";

// 定義一個基本的路由
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/getFullBoard", async (req, res) => {
  const response = await showTable();
  res.json({ data: response });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const message = req.body.message; // 獲取 message

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const params = {
    Bucket: "taipei-day-trip-s3-bucket",
    Key: `${folderName}/${file.originalname}`,
    Body: file.buffer,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("文件上傳失敗");
    } else {
      const imgUrl = `${CDN_URL}/${folderName}/${file.originalname}`;
      try {
        const response = insertTable(message, imgUrl);
      } catch (error) {
        console.log(error);
      }
      res.status(200).json({
        success: true,
      });
    }
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器正在 http://localhost:${port} 上運行`);
});
