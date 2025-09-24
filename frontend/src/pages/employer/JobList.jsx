import React, { useEffect, useState } from "react";
import { getJobList } from "../../api/employer";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("employerToken") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        const res = await getJobList(token);
        setJobs(res.jobs || []);
      } catch {
        setError("Failed to fetch jobs.");
      }
      setLoading(false);
    }
    fetchJobs();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Posted Jobs</h2>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Date Posted</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>No jobs posted yet.</td>
            </tr>
          )}
          {jobs.map(job => (
            <tr key={job._id}>
              <td>{job.title}</td>
              <td>{job.location}</td>
              <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}