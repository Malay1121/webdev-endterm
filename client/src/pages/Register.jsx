import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getError } from "../api";
import { useAuth } from "../AuthContext";

function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data);
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div className="auth-box card">
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn full" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="small">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
