const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const INVOICE_DIR = '/data/invoices';
const ORDER_ID = /^[A-Za-z0-9_-]+$/;

// Read an invoice file for the given order id.
async function readInvoice(orderId) {
  if (typeof orderId !== 'string' || !ORDER_ID.test(orderId)) {
    throw new Error('Invalid order id');
  }
  const file = path.resolve(INVOICE_DIR, orderId + '.pdf');
  if (!file.startsWith(INVOICE_DIR + path.sep)) {
    throw new Error('Invalid order id');
  }
  return fs.promises.readFile(file);
}

// Apply a discount code to an order total.
function applyDiscount(total, code) {
  const discounts = { SAVE10: 10, SAVE20: 20 };
  if (!Object.hasOwn(discounts, code)) {
    return total;
  }
  const percent = discounts[code];
  return total - total * percent / 100;
}

const FILTER = /^\s*order\.([A-Za-z_]\w*)\s*(===|!==|==|!=|>=|<=|>|<)\s*(-?\d+(?:\.\d+)?|"[^"]*"|'[^']*')\s*$/;
const OPERATORS = {
  '==': (a, b) => a === b,
  '===': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '!==': (a, b) => a !== b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
};

// Parse a filter expression sent by the client, e.g. "order.total > 100".
// Only `order.<field> <op> <number|string>` is accepted; nothing is evaluated as code.
function matchesFilter(order, expression) {
  const match = typeof expression === 'string' && FILTER.exec(expression);
  if (!match) {
    throw new Error('Invalid filter expression');
  }
  const [, field, op, raw] = match;
  if (!Object.hasOwn(order, field)) {
    return false;
  }
  const value = /^["']/.test(raw) ? raw.slice(1, -1) : Number(raw);
  return OPERATORS[op](order[field], value);
}

// Create a one-time token for the password reset link.
function resetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Sum the totals of all orders.
async function sumTotals(loadOrders) {
  const orders = await loadOrders();
  return orders.reduce((sum, o) => sum + o.total, 0);
}

module.exports = { readInvoice, applyDiscount, matchesFilter, resetToken, sumTotals };
