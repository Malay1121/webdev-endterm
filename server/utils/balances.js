const round = (n) => Math.round(n * 100) / 100;

const calculateBalances = (members, expenses, settlements) => {
  const balance = {};
  members.forEach((m) => (balance[m._id.toString()] = 0));

  expenses.forEach((exp) => {
    const payer = exp.paidBy._id ? exp.paidBy._id.toString() : exp.paidBy.toString();
    const people = exp.splitBetween.map((p) => (p._id ? p._id.toString() : p.toString()));
    if (people.length === 0) return;
    const share = exp.amount / people.length;

    if (balance[payer] === undefined) balance[payer] = 0;
    balance[payer] += exp.amount;
    people.forEach((p) => {
      if (balance[p] === undefined) balance[p] = 0;
      balance[p] -= share;
    });
  });

  settlements.forEach((s) => {
    const from = s.from._id ? s.from._id.toString() : s.from.toString();
    const to = s.to._id ? s.to._id.toString() : s.to.toString();
    if (balance[from] === undefined) balance[from] = 0;
    if (balance[to] === undefined) balance[to] = 0;
    balance[from] += s.amount;
    balance[to] -= s.amount;
  });

  Object.keys(balance).forEach((k) => (balance[k] = round(balance[k])));
  return balance;
};

const simplifyDebts = (balance) => {
  const debtors = [];
  const creditors = [];

  Object.keys(balance).forEach((id) => {
    if (balance[id] < -0.01) debtors.push({ id, amount: -balance[id] });
    else if (balance[id] > 0.01) creditors.push({ id, amount: balance[id] });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const result = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    result.push({ from: debtors[i].id, to: creditors[j].id, amount: round(pay) });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return result;
};

module.exports = { calculateBalances, simplifyDebts };
