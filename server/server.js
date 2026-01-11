const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const managersRouter = require('./routes/managers');
const clientsRouter = require('./routes/clients');
const profilesRouter = require('./routes/profiles');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/managers', managersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/profiles', profilesRouter);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;