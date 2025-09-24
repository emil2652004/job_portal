import React, { useEffect, useState } from "react";
import { getEmployerList, deleteEmployer } from "../../api/admin";

export default function EmployersList() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("adminToken") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmployers() {
      setLoading(true);
      setError("");
      try {
        const res = await getEmployerList(token);
        setEmployers(res.data || []);
      } catch (err) {
        setError("Failed to fetch employers.");
      }
      setLoading(false);
    }
    fetchEmployers();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employer?")) return;
    await deleteEmployer(id, token);
    setEmployers(employers.filter(emp => emp._id !== id));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Employers List</h2>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employers.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No employers found.</td>
            </tr>
          )}
          {employers.map(emp => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.companyName}</td>
              <td>
                <button onClick={() => handleDelete(emp._id)} style={{ color: "red" }}>
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