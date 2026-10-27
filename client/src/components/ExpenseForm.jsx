import { useState } from "react";
import api, { getError } from "../api";
import { categories } from "../utils";

function ExpenseForm({ group, currentUser, onAdded, onCancel }) {
  const allIds = group.members.map((m) => m._id);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy] = useState(currentUser._id);
  const [splitBetween, setSplitBetween] = useState(allIds);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const togglePerson = (id) => {
    if (splitBetween.includes(id)) {
      setSplitBetween(splitBetween.filter((x) => x !== id));
    } else {
      setSplitBetween([...splitBetween, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (splitBetween.length === 0) {
      setError("Select at least one person");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/groups/${group._id}/expenses`, {
        description,
        amount,
        category,
        paidBy,
        splitBetween,
        date,
      });
      onAdded();
    } catch (err) {
      setError(getError(err));
    }
    setSaving(false);
  };

  const share = amount && splitBetween.length ? (amount / splitBetween.length).toFixed(2) : 0;

  return (
    <form className="card expense-form" onSubmit={handleSubmit}>
      <h4>Add an expense</h4>
      {error && <p className="error">{error}</p>}

      <div className="two-col">
        <div>
          <label>Description</label>
          <input
            placeholder="eg. Dinner at Dominos"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount (₹)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Paid by</label>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {group.members.map((m) => (
              <option key={m._id} value={m._id}>
                {m._id === currentUser._id ? "You" : m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <label>Split equally between</label>
      <div className="checks">
        {group.members.map((m) => (
          <label key={m._id} className="check">
            <input
              type="checkbox"
              checked={splitBetween.includes(m._id)}
              onChange={() => togglePerson(m._id)}
            />
            {m._id === currentUser._id ? "You" : m.name}
          </label>
        ))}
      </div>
      {share > 0 && <p className="muted small">Each person pays ₹{share}</p>}

      <div className="form-btns">
        <button className="btn" disabled={saving}>
          {saving ? "Saving..." : "Save expense"}
        </button>
        <button type="button" className="btn btn-grey" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
