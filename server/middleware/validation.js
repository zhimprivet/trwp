const Manager = require('../models/Manager');
const Client = require('../models/Client');
const Profile = require('../models/Profile');

// Проверка возможности назначения клиента менеджеру
async function validateClientAssignment(managerId, clientId, currentManagerId = null) {
  try {
    // Получаем данные менеджера
    const manager = await Manager.getById(managerId);
    if (!manager) {
      return { valid: false, message: 'Менеджер не найден' };
    }

    // Получаем данные клиента
    const client = await Client.getById(clientId);
    if (!client) {
      return { valid: false, message: 'Клиент не найден' };
    }

    // Проверяем соответствие профилей
    if (client.required_profile_id !== manager.profile_id) {
      const profile = await Profile.getById(client.required_profile_id);
      return {
        valid: false,
        message: `Профиль менеджера не соответствует требуемому профилю клиента: ${profile ? profile.name : 'неизвестен'}`
      };
    }

    // Проверяем количество клиентов
    let currentClientsCount = manager.current_clients || 0;

    // Если клиент уже закреплен за этим менеджером, не увеличиваем счетчик
    if (currentManagerId === managerId) {
      // Клиент уже у этого менеджера, изменений по количеству нет
    } else if (currentManagerId) {
      // Перевод от другого менеджера - счетчик не меняется для целевого
    } else {
      // Новое назначение - проверяем лимит
      if (currentClientsCount >= manager.max_clients) {
        return {
          valid: false,
          message: `Менеджер уже работает с максимальным количеством клиентов (${manager.max_clients})`
        };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Ошибка валидации: ' + error.message };
  }
}

module.exports = {
  validateClientAssignment
};