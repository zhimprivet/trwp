const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const Client = require('../models/Client');
const { v4: uuidv4 } = require('uuid');

// Получить всех менеджеров
router.get('/', async (req, res) => {
  try {
    const managers = await Manager.getAll();
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить менеджера по ID
router.get('/:id', async (req, res) => {
  try {
    const manager = await Manager.getById(req.params.id);
    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ error: 'Manager not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить клиентов менеджера
router.get('/:id/clients', async (req, res) => {
  try {
    const clients = await Client.getByManagerId(req.params.id);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать нового менеджера
router.post('/', async (req, res) => {
  try {
    const { full_name, profile_id, max_clients } = req.body;
    if (!full_name || !profile_id) {
      return res.status(400).json({ error: 'Full name and profile are required' });
    }
    const id = uuidv4();
    const manager = await Manager.create(id, full_name, profile_id, max_clients || 10);
    res.status(201).json(manager);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить менеджера
router.put('/:id', async (req, res) => {
  try {
    const { full_name, profile_id, max_clients } = req.body;
    if (!full_name || !profile_id) {
      return res.status(400).json({ error: 'Full name and profile are required' });
    }

    // Проверяем, не уменьшается ли max_clients ниже текущего количества клиентов
    const currentCount = await Manager.getClientsCount(req.params.id);
    if (max_clients < currentCount) {
      return res.status(400).json({
        error: `Невозможно установить лимит ${max_clients}. У менеджера уже ${currentCount} клиентов`
      });
    }

    const manager = await Manager.update(req.params.id, full_name, profile_id, max_clients);
    res.json(manager);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить менеджера
router.delete('/:id', async (req, res) => {
  try {
    const result = await Manager.delete(req.params.id);
    if (result.deleted > 0) {
      res.json({ message: 'Manager deleted successfully' });
    } else {
      res.status(404).json({ error: 'Manager not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;