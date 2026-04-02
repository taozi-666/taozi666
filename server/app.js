const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const { createLife, saveLife, getLife } = require('./database');

const app = express();
const port = 3000;

// 配置 - 部署时需在 Railway 设置环境变量 BASE_URL
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5500';

// 存储上传文件
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============ API ============

// 创建生平
app.post('/api/create', (req, res) => {
  const { title } = req.body;
  if (!title) return res.json({ code: 400, msg: '请输入标题' });
  const life = createLife(title || '匿名一生');
  res.json({ code: 200, ...life });
});

// 保存生平
app.post('/api/save', (req, res) => {
  const { token, content, media } = req.body;
  if (!token) return res.json({ code: 400, msg: '缺少 token' });
  const ok = saveLife(token, content, media);
  res.json({ code: ok ? 200 : 400, msg: ok ? '保存成功' : '保存失败' });
});

// 获取生平
app.get('/api/get/:id', (req, res) => {
  const life = getLife(req.params.id);
  if (!life) return res.json({ code: 404, msg: '未找到' });
  res.json({
    code: 200,
    title: life.title,
    content: life.content,
    media: life.media,
    createdAt: life.created_at
  });
});

// 上传图片
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.json({ code: 400, msg: '未上传文件' });
  const url = `${BASE_URL}/uploads/${req.file.filename}`;
  res.json({ code: 200, url });
});

// 生成二维码
app.post('/api/qrcode', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.json({ code: 400, msg: '缺少 url' });
  try {
    const qrcode = await QRCode.toDataURL(url);
    res.json({ code: 200, qrcode, url });
  } catch (err) {
    res.json({ code: 500, msg: '生成失败' });
  }
});

// 启动
app.listen(port, () => {
  console.log(`后端已启动：http://127.0.0.1:${port}`);
});
