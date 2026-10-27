const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const group = await Group.findById(expense.group);
    if (!group || !group.members.some((m) => m.equals(req.user._id))) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
