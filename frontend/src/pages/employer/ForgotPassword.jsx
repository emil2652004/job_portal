import React, { useState } from "react";
import { forgotPassword, resetPassword } from "../../api/employer";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request OTP, 2: reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.status) {
        setMessage("OTP sent to your email.");
        setStep(2);
      } else {
        setError(res.message || "Failed to send OTP.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await resetPassword(email, otp, newPassword);
      if (res.status) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login"); // Use "/login" if you have a single login page for all roles
        }, 1500);
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Employer Forgot Password</h2>
      {step === 1 && (
        <form onSubmit={handleRequestOtp}>
          <div style={{ marginBottom: 16 }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          {message && <div style={{ color: "green", marginBottom: 8 }}>{message}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: 16 }}>
            <label>OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          {message && <div style={{ color: "green", marginBottom: 8 }}>{message}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}