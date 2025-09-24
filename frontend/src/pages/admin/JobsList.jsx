import React, { useEffect, useState } from "react";
import { getAllJobs } from "../../api/admin";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("adminToken") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        const res = await getAllJobs(token);
        setJobs(res.jobs || []);
      } catch (err) {
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
      <h2>All Jobs</h2>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Posted By</th>
            <th>Date Posted</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No jobs found.</td>
            </tr>
          )}
          {jobs.map(job => (
            <tr key={job._id}>
              <td>{job.title}</td>
              <td>{job.companyName}</td>
              <td>{job.location}</td>
              <td>{job.postedBy?.email || "N/A"}</td>
              <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}