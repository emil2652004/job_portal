import React, { useState, useEffect } from "react";
import { adminLogin } from "../api/admin";
import { employerLogin } from "../api/employer";
import { userLogin } from "../api/user";
import { useNavigate, Link } from "react-router-dom";

const roleEndpoints = {
  admin: adminLogin,
  employer: employerLogin,
  user: userLogin,
};

export default function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Remove up-down scroll when this page is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loginFunc = roleEndpoints[role];
      const res = await loginFunc(email, password);
      const token = res.token || res.data?.token;
      if (res.status && token) {
        localStorage.setItem(`${role}Token`, token);
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "employer") navigate("/employer/dashboard");
        else navigate("/user/dashboard");
      } else {
        setError(res.message || "Login failed.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "8c0vh",
        width: "100vw",
        overflow: "hidden", // Prevents up-down and left-right scroll
        background: "linear-gradient(120deg, #e3f0fc 0%, #f9fbe7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "rgba(255,255,255,0.97)",
          padding: 40,
          borderRadius: 20,
          boxShadow: "0 12px 40px rgba(25, 118, 210, 0.13)",
          textAlign: "center",
          animation: "fadeInUp 1s cubic-bezier(.23,1.01,.32,1) both",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1976d2 60%, #43a047 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px #1976d233",
              marginBottom: 0,
              animation: "popIn 0.7s cubic-bezier(.23,1.01,.32,1) both",
            }}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="24" fill="#fff" />
              <path d="M16 32v-2a6 6 0 016-6h4a6 6 0 016 6v2" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="18" r="5" stroke="#43a047" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <h2
          style={{
            color: "#1976d2",
            fontWeight: 800,
            fontSize: "2rem",
            marginBottom: 18,
            letterSpacing: 1,
            fontFamily: "Segoe UI, Arial, sans-serif",
          }}
        >
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Role:</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: 10,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 16,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                display: "block",
              }}
            >
              <option value="admin">Admin</option>
              <option value="employer">Employer</option>
              <option value="user">User</option>
            </select>
          </div>
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: 10,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 16,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                display: "block",
              }}
            />
          </div>
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: 10,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 16,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                display: "block",
              }}
            />
          </div>
          {error && (
            <div style={{ color: "#d32f2f", marginBottom: 16, fontWeight: 600 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1.08rem",
              letterSpacing: 0.5,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 12px rgba(25,118,210,0.13)",
              transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "linear-gradient(90deg, #1565c0 60%, #388e3c 100%)";
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 4px 18px #1976d244";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "linear-gradient(90deg, #1976d2 60%, #43a047 100%)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(25,118,210,0.13)";
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link
            to={`/${role}/forgot-password`}
            style={{
              color: "#1976d2",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.color = "#43a047")}
            onMouseOut={e => (e.currentTarget.style.color = "#1976d2")}
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 40px, 0);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          @keyframes popIn {
            0% { transform: scale(0.7); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}