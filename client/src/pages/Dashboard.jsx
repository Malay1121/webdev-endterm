import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getError } from "../api";
import { useAuth } from "../AuthContext";
import { money } from "../utils";

function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/groups", { name, description });
      setName("");
      setDescription("");
      setShowForm(false);
      loadGroups();
    } catch (err) {
      setError(getError(err));
    }
  };

  let owe = 0;
  let owed = 0;
  groups.forEach((g) => {
    if (g.myBalance < 0) owe += -g.myBalance;
    else owed += g.myBalance;
  });

  return (
    <div>
      <h2>Welcome back, {user.name}</h2>

      <div className="summary">
        <div className="card">
          <p className="label">You owe</p>
          <p className="big red">{money(owe)}</p>
        </div>
        <div className="card">
          <p className="label">You are owed</p>
          <p className="big green">{money(owed)}</p>
        </div>
        <div className="card">
          <p className="label">Groups</p>
          <p className="big">{groups.length}</p>
        </div>
      </div>

      <div className="row-between">
        <h3>Your groups</h3>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New group"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="card form-inline" onSubmit={createGroup}>
          <input
            placeholder="Group name (eg. Goa Trip)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn">Create</button>
        </form>
      )}

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="empty">You are not in any group yet. Create one to get started!</p>
      ) : (
        <div className="group-list">
          {groups.map((g) => (
            <Link to={"/groups/" + g._id} key={g._id} className="card group-card">
              <h4>{g.name}</h4>
              {g.description && <p className="muted">{g.description}</p>}
              <p className="muted small">
                {g.members.length} member{g.members.length > 1 ? "s" : ""} · Total {money(g.totalSpent)}
              </p>
              {g.myBalance > 0 && <p className="green">You get back {money(g.myBalance)}</p>}
              {g.myBalance < 0 && <p className="red">You owe {money(-g.myBalance)}</p>}
              {g.myBalance === 0 && <p className="muted">All settled up</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
