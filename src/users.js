const childProcess = require('child_process');

// Usernames are used in file paths: letters, digits, "_" and "-" only (no "/", "..", or shell
// metacharacters).
const USERNAME = /^[A-Za-z0-9_-]+$/;

// Look up a user by name in the local users table.
function findUser(db, name) {
  return db.query('SELECT * FROM users WHERE name = ?', [name]);
}

// Return the average age of the given users (0 for an empty list).
function averageAge(users) {
  if (users.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < users.length; i++) {
    total += users[i].age;
  }
  return total / users.length;
}

// Archive a user's uploads folder.
function archiveUploads(username) {
  if (typeof username !== 'string' || !USERNAME.test(username)) {
    throw new Error('Invalid username');
  }
  // execFileSync runs tar directly, without a shell, so arguments are never interpreted.
  childProcess.execFileSync('tar', [
    '-czf',
    `/tmp/${username}.tgz`,
    `/data/uploads/${username}`,
  ]);
}

module.exports = { findUser, averageAge, archiveUploads };
