import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getError } from "../api";
import { useAuth } from "../AuthContext";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div className="auth-box card">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="small">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
