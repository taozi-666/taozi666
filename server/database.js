const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'lifes.db'));

// 初始化表
db.exec(`
  CREATE TABLE IF NOT EXISTS lifes (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT DEFAULT '',
    media TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 创建新生平
function createLife(title) {
  const id = generateId();
  const token = generateId();
  const stmt = db.prepare('INSERT INTO lifes (id, token, title) VALUES (?, ?, ?)');
  stmt.run(id, token, title);
  return { id, token };
}

// 保存生平内容
function saveLife(token, content, media) {
  const stmt = db.prepare('UPDATE lifes SET content = ?, media = ? WHERE token = ?');
  const result = stmt.run(content, media || '', token);
  return result.changes > 0;
}

// 获取生平
function getLife(id) {
  const stmt = db.prepare('SELECT * FROM lifes WHERE id = ? OR token = ?');
  return stmt.get(id, id);
}

// 生成短 ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

module.exports = { createLife, saveLife, getLife };
