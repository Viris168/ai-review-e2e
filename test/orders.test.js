const test = require('node:test');
const assert = require('node:assert');
const { readInvoice, applyDiscount, matchesFilter, resetToken, sumTotals } = require('../src/orders');

test('applyDiscount applies known codes', () => {
  assert.strictEqual(applyDiscount(200, 'SAVE10'), 180);
  assert.strictEqual(applyDiscount(200, 'SAVE20'), 160);
});

test('applyDiscount ignores unknown and prototype codes', () => {
  assert.strictEqual(applyDiscount(200, 'BOGUS'), 200);
  assert.strictEqual(applyDiscount(200, 'constructor'), 200);
  assert.strictEqual(applyDiscount(200, undefined), 200);
});

test('readInvoice rejects ids that could escape the invoice dir', async () => {
  for (const id of ['../x', '../../etc/passwd', 'a/b', '', 'a\0b', 42]) {
    await assert.rejects(readInvoice(id), /Invalid order id/);
  }
});

test('matchesFilter evaluates whitelisted comparisons', () => {
  const order = { total: 150, status: 'paid' };
  assert.strictEqual(matchesFilter(order, 'order.total > 100'), true);
  assert.strictEqual(matchesFilter(order, 'order.total <= 100'), false);
  assert.strictEqual(matchesFilter(order, "order.status == 'paid'"), true);
  assert.strictEqual(matchesFilter(order, 'order.status != "paid"'), false);
  assert.strictEqual(matchesFilter(order, 'order.missing > 1'), false);
});

test('matchesFilter rejects anything that is not a simple comparison', () => {
  for (const expr of [
    "require('child_process').execSync('id')",
    'order.total > 100 || process.exit(1)',
    'order.constructor.constructor("return 1")()',
    'order.total > foo',
  ]) {
    assert.throws(() => matchesFilter({ total: 1 }, expr), /Invalid filter expression/);
  }
});

test('resetToken is 32 random bytes in hex', () => {
  const a = resetToken();
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notStrictEqual(a, resetToken());
});

test('sumTotals works with sync and async loaders', async () => {
  const orders = [{ total: 10 }, { total: 5.5 }];
  assert.strictEqual(await sumTotals(() => orders), 15.5);
  assert.strictEqual(await sumTotals(async () => orders), 15.5);
});
