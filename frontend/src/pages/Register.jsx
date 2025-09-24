import React, { useState, useEffect } from "react";
import { registerEmployer } from "../api/employer";
import { registerUser } from "../api/user";
import { useNavigate } from "react-router-dom";
import { verifyUserEmail, verifyEmployerEmail } from "../api/user";

export default function Register() {
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();

  // Remove up-down scroll when this page is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      let res;
      if (role === "employer") {
        res = await registerEmployer({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role,
        });
      } else {
        res = await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role,
        });
      }
      if (res.status) {
        setPendingEmail(form.email);
        setShowOtpModal(true);
        setMessage("");
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpError("");
    try {
      let res;
      if (role === "employer") {
        res = await verifyEmployerEmail({ email: pendingEmail, otp });
      } else {
        res = await verifyUserEmail({ email: pendingEmail, otp });
      }
      if (res.status) {
        setShowOtpModal(false);
        setMessage("Email verified! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setOtpError(res.message || "Invalid OTP.");
      }
    } catch {
      setOtpError("Network error.");
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        width: "100vw",
        overflow: "hidden", // Prevents up-down and left-right scroll
        background: "linear-gradient(120deg, #e3f0fc 0%, #f9fbe7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "rgba(255,255,255,0.97)",
          padding: "24px 20px", // unified padding for consistent box height
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
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60, // fixed to 60px for round icon
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
            fontSize: "1.7rem",
            marginBottom: 14,
            letterSpacing: 1,
            fontFamily: "Segoe UI, Arial, sans-serif",
          }}
        >
          Register
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Role:</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                marginTop: 5,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 15,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                boxSizing: "border-box",
              }}
            >
              <option value="user">User</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <div style={{ marginBottom: 12, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Name:</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "7px 10px",
                marginTop: 5,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 15,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Email:</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "7px 10px",
                marginTop: 5,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 15,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Password:</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "7px 10px",
                marginTop: 5,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 15,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                boxSizing: "border-box",
              }}
            />
          </div>
       
          <div style={{ marginBottom: 12, textAlign: "left" }}>
            <label style={{ fontWeight: 600, color: "#1976d2" }}>Phone:</label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "7px 10px",
                marginTop: 5,
                borderRadius: 8,
                border: "1px solid #b0bec5",
                fontSize: 15,
                background: "#f7fafd",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
                color: "#222",
                boxSizing: "border-box",
              }}
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              title="Enter a valid 10-digit phone number starting with 6, 7, 8, or 9"
            />
          </div>
          {error && <div style={{ color: "#d32f2f", marginBottom: 6, fontWeight: 600 }}>{error}</div>}
          {message && <div style={{ color: "#43a047", marginBottom: 6, fontWeight: 600 }}>{message}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: "#fff", padding: 32, borderRadius: 12, minWidth: 320, boxShadow: "0 8px 32px rgba(25,118,210,0.13)", position: "relative", animation: "fadeInUp 0.7s"
            }}>
              <button onClick={() => setShowOtpModal(false)} style={{
                position: "absolute", top: 10, right: 16, background: "none", border: "none", fontSize: 22, color: "#888", cursor: "pointer"
              }}>&times;</button>
              <h3 style={{ color: "#1976d2", marginBottom: 18, textAlign: "center" }}>Verify OTP</h3>
              <form onSubmit={handleOtpVerify}>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                  maxLength={6}
                  style={{ width: "100%", padding: 10, marginBottom: 16, fontSize: 16, borderRadius: 8, border: "1px solid #b0bec5", background: "#f7fafd" }}
                />
                {otpError && <div style={{ color: "#d32f2f", marginBottom: 10 }}>{otpError}</div>}
                <button type="submit" style={{
                  width: "100%",
                  padding: 10,
                  background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "1.08rem",
                  letterSpacing: 0.5,
                  cursor: "pointer",
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
                  Verify
                </button>
              </form>
            </div>
          </div>
        )}
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