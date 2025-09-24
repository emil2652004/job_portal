import React, { useState } from "react";
import { postJob } from "../../api/employer";

export default function JobPost() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    jobType: "",
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("employerToken") || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await postJob(token, form);
      if (res.status) {
        setMessage("Job posted successfully!");
        setForm({
          title: "",
          description: "",
          company: "",
          location: "",
          salary: "",
          jobType: "",
        });
      } else {
        setError(res.message || "Failed to post job.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <h2>Post a New Job</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Title:</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Location:</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Salary:</label>
          <input
            name="salary"
            value={form.salary}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Company:</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Job Type:</label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            <option value="">Select Job Type</option>
            <option value="Full-time">Full Time</option>
            <option value="Part-time">Part Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {message && <div style={{ color: "green", marginBottom: 8 }}>{message}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}