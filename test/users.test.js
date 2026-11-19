const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('child_process');
const { findUser, averageAge, archiveUploads } = require('../src/users');

test('findUser passes the name as a query parameter, not in the SQL', () => {
  const calls = [];
  const db = { query: (sql, params) => calls.push({ sql, params }) };
  findUser(db, "x' OR '1'='1");
  assert.deepEqual(calls, [
    { sql: 'SELECT * FROM users WHERE name = ?', params: ["x' OR '1'='1"] },
  ]);
});

test('averageAge averages every user', () => {
  assert.equal(averageAge([{ age: 20 }, { age: 30 }, { age: 40 }]), 30);
});

test('averageAge of an empty list is 0', () => {
  assert.equal(averageAge([]), 0);
});

test('archiveUploads runs tar without a shell', (t) => {
  const run = t.mock.method(childProcess, 'execFileSync', () => {});
  archiveUploads('alice_01');
  assert.deepEqual(run.mock.calls[0].arguments, [
    'tar',
    ['-czf', '/tmp/alice_01.tgz', '/data/uploads/alice_01'],
  ]);
});

test('archiveUploads rejects names with shell or path characters', (t) => {
  const run = t.mock.method(childProcess, 'execFileSync', () => {});
  for (const bad of ['a; rm -rf /', '../etc', 'a/b', '$(id)', '', 42]) {
    assert.throws(() => archiveUploads(bad), /Invalid username/);
  }
  assert.equal(run.mock.calls.length, 0);
});
