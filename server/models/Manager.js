const db = require('../config/database');

class Manager {
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, p.name as profile_name,
               COUNT(c.id) as current_clients
        FROM managers m
        LEFT JOIN profiles p ON m.profile_id = p.id
        LEFT JOIN clients c ON m.id = c.manager_id
        GROUP BY m.id
        ORDER BY m.full_name
      `;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, p.name as profile_name,
               COUNT(c.id) as current_clients
        FROM managers m
        LEFT JOIN profiles p ON m.profile_id = p.id
        LEFT JOIN clients c ON m.id = c.manager_id
        WHERE m.id = ?
        GROUP BY m.id
      `;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(id, full_name, profile_id, max_clients = 10) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO managers (id, full_name, profile_id, max_clients) VALUES (?, ?, ?, ?)',
        [id, full_name, profile_id, max_clients],
        function(err) {
          if (err) reject(err);
          else resolve({ id, full_name, profile_id, max_clients });
        }
      );
    });
  }

  static update(id, full_name, profile_id, max_clients) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE managers SET full_name = ?, profile_id = ?, max_clients = ? WHERE id = ?',
        [full_name, profile_id, max_clients, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, full_name, profile_id, max_clients });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      // Сначала удаляем связь клиентов с менеджером
      db.run('UPDATE clients SET manager_id = NULL WHERE manager_id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        // Затем удаляем менеджера
        db.run('DELETE FROM managers WHERE id = ?', [id], function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        });
      });
    });
  }

  static getClientsCount(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM clients WHERE manager_id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }
}

module.exports = Manager;