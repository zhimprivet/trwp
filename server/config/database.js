const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Инициализация таблиц
db.serialize(() => {
  // Таблица профилей
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица менеджеров
  db.run(`
    CREATE TABLE IF NOT EXISTS managers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      max_clients INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    )
  `);

  // Таблица клиентов
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      legal_form TEXT NOT NULL,
      required_profile_id TEXT NOT NULL,
      manager_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (required_profile_id) REFERENCES profiles(id),
      FOREIGN KEY (manager_id) REFERENCES managers(id)
    )
  `);

  // Вставка начальных профилей
  const initialProfiles = [
    'Страхование имущества',
    'Страхование ответственности',
    'Страхование персонала',
    'Кредитование малого бизнеса',
    'Кредитование крупного бизнеса',
    'Расчетно-кассовое обслуживание',
    'Валютный контроль',
    'Инвестиционные услуги'
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO profiles (id, name) VALUES (?, ?)
  `);

  initialProfiles.forEach((profile, index) => {
    const { v4: uuidv4 } = require('uuid');
    stmt.run(uuidv4(), profile);
  });

  stmt.finalize();
});

module.exports = db;