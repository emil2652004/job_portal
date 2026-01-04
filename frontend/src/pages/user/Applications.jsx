import React, { useEffect, useState } from "react";
import { getUserApplications } from "../../api/user";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("userToken") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserApplications(token);
        setApplications(res.applications || []);
      } catch {
        setError("Failed to fetch applications.");
      }
      setLoading(false);
    }
    fetchApplications();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>My Job Applications</h2>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Applied On</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No applications found.</td>
            </tr>
          )}
          {applications.map((app, idx) => (
            <tr key={idx}>
              <td>{app.jobTitle || app.job?.title}</td>
              <td>{app.companyName || app.job?.companyName}</td>
              <td>{app.status || "Pending"}</td>
              <td>
                {app.appliedAt
                  ? new Date(app.appliedAt).toLocaleDateString()
                  : app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                {app.resume ? (
                  <a href={`https://job-portal-1-2je8.onrender.com/${app.resume}`} target="_blank" rel="noopener noreferrer">View Resume</a>
                ) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}