const db = require('../config/database');

class Client {
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, p.name as required_profile_name,
               m.full_name as manager_name, m.id as manager_id
        FROM clients c
        LEFT JOIN profiles p ON c.required_profile_id = p.id
        LEFT JOIN managers m ON c.manager_id = m.id
        ORDER BY c.name
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
        SELECT c.*, p.name as required_profile_name,
               m.full_name as manager_name
        FROM clients c
        LEFT JOIN profiles p ON c.required_profile_id = p.id
        LEFT JOIN managers m ON c.manager_id = m.id
        WHERE c.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static getByManagerId(managerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, p.name as required_profile_name
        FROM clients c
        LEFT JOIN profiles p ON c.required_profile_id = p.id
        WHERE c.manager_id = ?
        ORDER BY c.name
      `;
      db.all(query, [managerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static create(id, name, legal_form, required_profile_id, manager_id = null) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO clients (id, name, legal_form, required_profile_id, manager_id) VALUES (?, ?, ?, ?, ?)',
        [id, name, legal_form, required_profile_id, manager_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, name, legal_form, required_profile_id, manager_id });
        }
      );
    });
  }

  static update(id, name, legal_form, required_profile_id) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE clients SET name = ?, legal_form = ?, required_profile_id = ? WHERE id = ?',
        [name, legal_form, required_profile_id, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, name, legal_form, required_profile_id });
        }
      );
    });
  }

  static assignToManager(clientId, managerId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE clients SET manager_id = ? WHERE id = ?',
        [managerId, clientId],
        function(err) {
          if (err) reject(err);
          else resolve({ clientId, managerId });
        }
      );
    });
  }

  static unassignFromManager(clientId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE clients SET manager_id = NULL WHERE id = ?',
        [clientId],
        function(err) {
          if (err) reject(err);
          else resolve({ clientId });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }
}

module.exports = Client;