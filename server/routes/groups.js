const express = require("express");
const mongoose = require("mongoose");
const Group = require("../models/Group");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const auth = require("../middleware/auth");
const { calculateBalances, simplifyDebts } = require("../utils/balances");

const router = express.Router();

router.use(auth);

const getMyGroup = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ message: "Group not found" });
    return null;
  }
  const group = await Group.findById(req.params.id).populate("members", "name email");
  if (!group) {
    res.status(404).json({ message: "Group not found" });
    return null;
  }
  const isMember = group.members.some((m) => m._id.equals(req.user._id));
  if (!isMember) {
    res.status(403).json({ message: "You are not a member of this group" });
    return null;
  }
  return group;
};

router.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "name email")
      .sort({ updatedAt: -1 });

    const result = [];
    for (const g of groups) {
      const expenses = await Expense.find({ group: g._id });
      const settlements = await Settlement.find({ group: g._id });
      const balance = calculateBalances(g.members, expenses, settlements);
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      result.push({
        _id: g._id,
        name: g.name,
        description: g.description,
        members: g.members,
        totalSpent: Math.round(total * 100) / 100,
        myBalance: balance[req.user._id.toString()] || 0,
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name,
      description,
      members: [req.user._id],
      createdBy: req.user._id,
    });

    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;
    res.json(group);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    if (!group.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the group creator can delete it" });
    }

    await Expense.deleteMany({ group: group._id });
    await Settlement.deleteMany({ group: group._id });
    await group.deleteOne();

    res.json({ message: "Group deleted" });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/members", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email. Ask them to sign up first." });
    }

    if (group.members.some((m) => m._id.equals(user._id))) {
      return res.status(400).json({ message: "User is already in this group" });
    }

    group.members.push(user._id);
    await group.save();
    await group.populate("members", "name email");

    res.json(group);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/expenses", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    const expenses = await Expense.find({ group: group._id })
      .populate("paidBy", "name")
      .populate("splitBetween", "name")
      .sort({ date: -1, createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/expenses", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    const { description, amount, category, paidBy, splitBetween, date } = req.body;
    const memberIds = group.members.map((m) => m._id.toString());

    if (!description || !amount || !paidBy) {
      return res.status(400).json({ message: "Description, amount and payer are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount should be more than 0" });
    }
    if (!memberIds.includes(paidBy)) {
      return res.status(400).json({ message: "Payer must be a group member" });
    }
    if (!splitBetween || splitBetween.length === 0) {
      return res.status(400).json({ message: "Select at least one person to split with" });
    }
    if (!splitBetween.every((id) => memberIds.includes(id))) {
      return res.status(400).json({ message: "Everyone in the split must be a group member" });
    }

    const expense = await Expense.create({
      group: group._id,
      description,
      amount: Number(amount),
      category: category || "Other",
      paidBy,
      splitBetween,
      date: date || Date.now(),
      addedBy: req.user._id,
    });

    group.updatedAt = new Date();
    await group.save();

    await expense.populate("paidBy", "name");
    await expense.populate("splitBetween", "name");
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/balances", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    const expenses = await Expense.find({ group: group._id });
    const settlements = await Settlement.find({ group: group._id });
    const balance = calculateBalances(group.members, expenses, settlements);
    const suggestions = simplifyDebts(balance);

    const nameOf = {};
    group.members.forEach((m) => (nameOf[m._id.toString()] = m.name));

    res.json({
      balances: group.members.map((m) => ({
        user: { _id: m._id, name: m.name },
        amount: balance[m._id.toString()] || 0,
      })),
      suggestions: suggestions.map((s) => ({
        from: { _id: s.from, name: nameOf[s.from] || "Unknown" },
        to: { _id: s.to, name: nameOf[s.to] || "Unknown" },
        amount: s.amount,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/settlements", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    const settlements = await Settlement.find({ group: group._id })
      .populate("from", "name")
      .populate("to", "name")
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/settle", async (req, res, next) => {
  try {
    const group = await getMyGroup(req, res);
    if (!group) return;

    const { from, to, amount } = req.body;
    const memberIds = group.members.map((m) => m._id.toString());

    if (!from || !to || !amount) {
      return res.status(400).json({ message: "From, to and amount are required" });
    }
    if (from === to) {
      return res.status(400).json({ message: "Cannot settle with yourself" });
    }
    if (!memberIds.includes(from) || !memberIds.includes(to)) {
      return res.status(400).json({ message: "Both users must be group members" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount should be more than 0" });
    }

    const settlement = await Settlement.create({
      group: group._id,
      from,
      to,
      amount: Number(amount),
    });

    res.status(201).json(settlement);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
