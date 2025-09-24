import React, { useEffect, useState } from "react";
import { getUserList, deleteUser } from "../../api/admin";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("adminToken") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserList(token);
        setUsers(res.users || []);
      } catch (err) {
        setError("Failed to fetch users.");
      }
      setLoading(false);
    }
    fetchUsers();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(id, token);
    setUsers(users.filter(u => u._id !== id));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Users List</h2>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Resume</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No users found.</td>
            </tr>
          )}
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {u.resume ? (
                  <a href={u.resume} target="_blank" rel="noopener noreferrer">View</a>
                ) : "N/A"}
              </td>
              <td>
                <button onClick={() => handleDelete(u._id)} style={{ color: "red" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}