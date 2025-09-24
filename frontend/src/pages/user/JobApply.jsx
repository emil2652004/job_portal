import React, { useState } from "react";
import { registerJob } from "../../api/user";

export default function JobApply({ jobId }) {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("userToken") || "");

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    if (!resume) {
      setError("Please upload your resume.");
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("resume", resume);

      const res = await registerJob(token, formData);
      if (res.status) {
        setMessage("Applied successfully!");
        setResume(null);
      } else {
        setError(res.message || "Failed to apply.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Apply for Job</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Upload Resume (PDF):</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            required
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {message && <div style={{ color: "green", marginBottom: 8 }}>{message}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Applying..." : "Apply"}
        </button>
      </form>
    </div>
  );
}