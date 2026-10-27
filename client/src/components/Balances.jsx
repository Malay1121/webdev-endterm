import api, { getError } from "../api";
import { money } from "../utils";

function Balances({ groupId, data, currentUser, onSettled }) {
  const nameFor = (u) => (u._id === currentUser._id ? "You" : u.name);

  const settle = async (s) => {
    const ok = window.confirm(`Mark ${money(s.amount)} paid from ${s.from.name} to ${s.to.name}?`);
    if (!ok) return;
    try {
      await api.post(`/groups/${groupId}/settle`, {
        from: s.from._id,
        to: s.to._id,
        amount: s.amount,
      });
      onSettled();
    } catch (err) {
      alert(getError(err));
    }
  };

  return (
    <div className="balances">
      <div className="card">
        <h4>Net balances</h4>
        {data.balances.map((b) => (
          <div className="list-row" key={b.user._id}>
            <span>{nameFor(b.user)}</span>
            {b.amount > 0 && <span className="green">gets back {money(b.amount)}</span>}
            {b.amount < 0 && <span className="red">owes {money(-b.amount)}</span>}
            {b.amount === 0 && <span className="muted">settled</span>}
          </div>
        ))}
      </div>

      <div className="card">
        <h4>Suggested payments</h4>
        {data.suggestions.length === 0 ? (
          <p className="muted">Everyone is settled up 🎉</p>
        ) : (
          data.suggestions.map((s, i) => (
            <div className="list-row" key={i}>
              <span>
                <b>{nameFor(s.from)}</b> {s.from._id === currentUser._id ? "pay" : "pays"}{" "}
                <b>{nameFor(s.to)}</b> {money(s.amount)}
              </span>
              <button className="btn btn-small" onClick={() => settle(s)}>
                Mark paid
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Balances;
