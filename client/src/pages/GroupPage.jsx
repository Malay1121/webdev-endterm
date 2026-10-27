import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { getError } from "../api";
import { useAuth } from "../AuthContext";
import { money, formatDate, categories } from "../utils";
import ExpenseForm from "../components/ExpenseForm";
import Balances from "../components/Balances";

function GroupPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ balances: [], suggestions: [] });
  const [settlements, setSettlements] = useState([]);
  const [tab, setTab] = useState("expenses");
  const [showForm, setShowForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMsg, setMemberMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [g, e, b, s] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/expenses`),
        api.get(`/groups/${id}/balances`),
        api.get(`/groups/${id}/settlements`),
      ]);
      setGroup(g.data);
      setExpenses(e.data);
      setBalances(b.data);
      setSettlements(s.data);
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const addMember = async (e) => {
    e.preventDefault();
    setMemberMsg("");
    try {
      const res = await api.post(`/groups/${id}/members`, { email: memberEmail });
      setGroup(res.data);
      setMemberEmail("");
      setMemberMsg("Member added!");
      loadAll();
    } catch (err) {
      setMemberMsg(getError(err));
    }
  };

  const deleteExpense = async (expId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${expId}`);
      loadAll();
    } catch (err) {
      alert(getError(err));
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm("This will delete the group and all its expenses. Are you sure?")) return;
    try {
      await api.delete(`/groups/${id}`);
      navigate("/dashboard");
    } catch (err) {
      alert(getError(err));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myBalance = balances.balances.find((b) => b.user._id === user._id)?.amount || 0;

  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const shown = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === "All" || e.category === filter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <Link to="/dashboard" className="back">
        ← Back
      </Link>

      <div className="group-header">
        <div>
          <h2>{group.name}</h2>
          {group.description && <p className="muted">{group.description}</p>}
          <div className="members">
            {group.members.map((m) => (
              <span className="chip" key={m._id} title={m.email}>
                {m._id === user._id ? "You" : m.name}
              </span>
            ))}
          </div>
        </div>
        <div className="group-stats">
          <p>
            Total spent: <b>{money(total)}</b>
          </p>
          {myBalance > 0 && <p className="green">You get back {money(myBalance)}</p>}
          {myBalance < 0 && <p className="red">You owe {money(-myBalance)}</p>}
          {myBalance === 0 && <p className="muted">You are settled up</p>}
        </div>
      </div>

      <form className="add-member" onSubmit={addMember}>
        <input
          type="email"
          placeholder="Add friend by email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          required
        />
        <button className="btn">Add</button>
        {memberMsg && <span className="small">{memberMsg}</span>}
      </form>

      <div className="tabs">
        <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}>
          Expenses
        </button>
        <button className={tab === "balances" ? "active" : ""} onClick={() => setTab("balances")}>
          Balances
        </button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
          Payments
        </button>
      </div>

      {tab === "expenses" && (
        <div>
          {showForm ? (
            <ExpenseForm
              group={group}
              currentUser={user}
              onCancel={() => setShowForm(false)}
              onAdded={() => {
                setShowForm(false);
                loadAll();
              }}
            />
          ) : (
            <button className="btn" onClick={() => setShowForm(true)}>
              + Add expense
            </button>
          )}

          {Object.keys(byCategory).length > 0 && (
            <div className="cat-summary">
              {Object.keys(byCategory).map((c) => (
                <span key={c} className="chip">
                  {c}: {money(byCategory[c])}
                </span>
              ))}
            </div>
          )}

          <div className="filters">
            <input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {shown.length === 0 ? (
            <p className="empty">No expenses yet.</p>
          ) : (
            shown.map((e) => (
              <div className="card expense" key={e._id}>
                <div className="date">{formatDate(e.date)}</div>
                <div className="exp-info">
                  <b>{e.description}</b>
                  <span className="tag">{e.category}</span>
                  <p className="muted small">
                    {e.paidBy._id === user._id ? "You" : e.paidBy.name} paid · split between{" "}
                    {e.splitBetween.map((p) => (p._id === user._id ? "You" : p.name)).join(", ")}
                  </p>
                </div>
                <div className="exp-amount">{money(e.amount)}</div>
                <button className="del" onClick={() => deleteExpense(e._id)} title="Delete">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "balances" && (
        <Balances groupId={id} data={balances} currentUser={user} onSettled={loadAll} />
      )}

      {tab === "history" && (
        <div className="card">
          <h4>Payments made</h4>
          {settlements.length === 0 ? (
            <p className="muted">No payments recorded yet.</p>
          ) : (
            settlements.map((s) => (
              <div className="list-row" key={s._id}>
                <span>
                  {s.from._id === user._id ? "You" : s.from.name} paid{" "}
                  {s.to._id === user._id ? "you" : s.to.name}
                </span>
                <span>
                  {money(s.amount)} <span className="muted small">· {formatDate(s.createdAt)}</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {group.createdBy === user._id && (
        <button className="btn btn-danger delete-group" onClick={deleteGroup}>
          Delete group
        </button>
      )}
    </div>
  );
}

export default GroupPage;
