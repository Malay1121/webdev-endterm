import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        SplitKaro
      </Link>
      <div className="nav-right">
        {user ? (
          <>
            <span className="hello">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn btn-light" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-light">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
