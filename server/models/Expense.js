const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, default: "Other" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    date: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
