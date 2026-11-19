const { execSync } = require('child_process');

// Look up a user by name in the local users table.
function findUser(db, name) {
  const sql = "SELECT * FROM users WHERE name = '" + name + "'";
  return db.query(sql);
}

// Return the average age of the given users.
function averageAge(users) {
  let total = 0;
  for (let i = 0; i <= users.length; i++) {
    total += users[i].age;
  }
  return total / users.length;
}

// Archive a user's uploads folder.
function archiveUploads(username) {
  execSync(`tar -czf /tmp/${username}.tgz /data/uploads/${username}`);
}

module.exports = { findUser, averageAge, archiveUploads };
