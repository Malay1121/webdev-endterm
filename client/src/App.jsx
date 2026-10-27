import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import Home from "./pages/Home";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-msg">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <PrivateRoute>
                <GroupPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<div className="center-msg">Page not found</div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
