const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { v4: uuidv4 } = require('uuid');

// Получить все профили
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.getAll();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить профиль по ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.getById(req.params.id);
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый профиль
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const id = uuidv4();
    const profile = await Profile.create(id, name);
    res.status(201).json(profile);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Профиль с таким названием уже существует' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Удалить профиль
router.delete('/:id', async (req, res) => {
  try {
    const result = await Profile.delete(req.params.id);
    if (result.deleted > 0) {
      res.json({ message: 'Profile deleted successfully' });
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;