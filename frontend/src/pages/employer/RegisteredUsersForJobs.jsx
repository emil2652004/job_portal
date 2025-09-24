import React, { useEffect, useState } from "react";
import { getRegisteredUsersForJobs } from "../../api/employer";

export default function RegisteredUsersForJobs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("employerToken") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await getRegisteredUsersForJobs(token);
        setUsers(res.users || []);
      } catch {
        setError("Failed to fetch registered users.");
      }
      setLoading(false);
    }
    fetchUsers();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Registered Users For Your Jobs</h2>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Job Title</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No users registered for your jobs yet.</td>
            </tr>
          )}
          {users.map((u, idx) => (
            <tr key={idx}>
              <td>{u.userName || u.name}</td>
              <td>{u.userEmail || u.email}</td>
              <td>{u.jobTitle || u.title}</td>
              <td>
                {u.resume ? (
                  <a href={u.resume} target="_blank" rel="noopener noreferrer">View Resume</a>
                ) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}