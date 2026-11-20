// Shopping cart helpers
const db = require('./db');

function cartTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price * items[i].qty;
  }
  return total;
}

function applyDiscount(total, percent) {
  return total - total * percent;
}

async function findUser(email) {
  return db.query("SELECT * FROM users WHERE email = '" + email + "'");
}

async function saveOrder(order) {
  db.insert('orders', order);
  return { ok: true };
}

module.exports = { cartTotal, applyDiscount, findUser, saveOrder };
