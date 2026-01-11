const db = require('../config/database');

class Profile {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM profiles ORDER BY name', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM profiles WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(id, name) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO profiles (id, name) VALUES (?, ?)',
        [id, name],
        function(err) {
          if (err) reject(err);
          else resolve({ id, name });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM profiles WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }
}

module.exports = Profile;