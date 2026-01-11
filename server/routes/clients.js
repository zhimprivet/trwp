const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Manager = require('../models/Manager');
const { validateClientAssignment } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

// Получить всех клиентов
router.get('/', async (req, res) => {
  try {
    const clients = await Client.getAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить клиента по ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.getById(req.params.id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать нового клиента
router.post('/', async (req, res) => {
  try {
    const { name, legal_form, required_profile_id, manager_id } = req.body;
    if (!name || !legal_form || !required_profile_id) {
      return res.status(400).json({ error: 'Name, legal form and required profile are required' });
    }

    const id = uuidv4();

    // Если указан менеджер, проверяем возможность назначения
    if (manager_id) {
      // Получаем данные менеджера
      const manager = await Manager.getById(manager_id);
      if (!manager) {
        return res.status(400).json({ error: 'Менеджер не найден' });
      }

      // Проверяем соответствие профилей
      if (required_profile_id !== manager.profile_id) {
        return res.status(400).json({
          error: 'Профиль менеджера не соответствует требуемому профилю клиента'
        });
      }

      // Проверяем количество клиентов
      const currentCount = await Manager.getClientsCount(manager_id);
      if (currentCount >= manager.max_clients) {
        return res.status(400).json({
          error: `Менеджер уже работает с максимальным количеством клиентов (${manager.max_clients})`
        });
      }
    }

    const client = await Client.create(id, name, legal_form, required_profile_id, manager_id);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновить клиента
router.put('/:id', async (req, res) => {
  try {
    const { name, legal_form, required_profile_id } = req.body;
    if (!name || !legal_form || !required_profile_id) {
      return res.status(400).json({ error: 'Name, legal form and required profile are required' });
    }

    // Получаем текущие данные клиента
    const currentClient = await Client.getById(req.params.id);
    if (!currentClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Если клиент назначен менеджеру и меняется профиль, проверяем совместимость
    if (currentClient.manager_id && required_profile_id !== currentClient.required_profile_id) {
      const manager = await Manager.getById(currentClient.manager_id);
      if (manager && manager.profile_id !== required_profile_id) {
        return res.status(400).json({
          error: 'Новый профиль клиента не соответствует профилю текущего менеджера. Сначала снимите клиента с менеджера.'
        });
      }
    }

    const client = await Client.update(req.params.id, name, legal_form, required_profile_id);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Назначить клиента менеджеру
router.post('/:id/assign', async (req, res) => {
  try {
    const { manager_id } = req.body;
    if (!manager_id) {
      return res.status(400).json({ error: 'Manager ID is required' });
    }

    const client = await Client.getById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const validation = await validateClientAssignment(manager_id, req.params.id, client.manager_id);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const result = await Client.assignToManager(req.params.id, manager_id);
    res.json(result);
  } catch (error) {
    console.error('Error assigning client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Снять клиента с менеджера
router.post('/:id/unassign', async (req, res) => {
  try {
    const result = await Client.unassignFromManager(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error unassigning client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить клиента
router.delete('/:id', async (req, res) => {
  try {
    const result = await Client.delete(req.params.id);
    if (result.deleted > 0) {
      res.json({ message: 'Client deleted successfully' });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;