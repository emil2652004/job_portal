import React, { useState } from "react";
import { verifyEmail } from "../../api/user";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await verifyEmail(email, otp);
      if (res.status) {
        setMessage("Email verified successfully!");
      } else {
        setError(res.message || "Verification failed.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .otp-input {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          color: #000 !important;
          background-color: #fff !important;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
      `}</style>
      <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>User Email Verification</h2>
      <form onSubmit={handleVerify}>
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
        <div style={{ marginBottom: 16 }}>
          <label>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            className="otp-input"
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {message && <div style={{ color: "green", marginBottom: 8 }}>{message}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>
    </div>
    </>
  );
}