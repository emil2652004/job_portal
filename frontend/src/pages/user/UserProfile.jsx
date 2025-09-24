import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../../api/user";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("userToken") || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserProfile(token);
        setProfile(res.user || null);
        setForm({
          name: res.user?.name || "",
          email: res.user?.email || ""
        });
      } catch {
        setError("Failed to fetch profile.");
      }
      setLoading(false);
    }
    fetchProfile();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await updateUserProfile(token, form);
      if (res.status) {
        setMessage("Profile updated successfully!");
        setProfile({ ...profile, ...form });
        setEdit(false);
      } else {
        setError(res.message || "Update failed.");
      }
    } catch {
      setError("Network error.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setError("");
    setMessage("");
    try {
      const res = await deleteUserAccount(token, profile._id);
      if (res.status) {
        setMessage("Account deleted. Logging out...");
        localStorage.removeItem("userToken");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError(res.message || "Delete failed.");
      }
    } catch {
      setError("Network error.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <h2>User Profile</h2>
      {message && <div style={{ color: "green", marginBottom: 8 }}>{message}</div>}
      {edit ? (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 12 }}>
            <label>Name:</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <button type="submit" style={{ marginRight: 8 }}>Save</button>
          <button type="button" onClick={() => setEdit(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <button onClick={() => setEdit(true)} style={{ marginRight: 8 }}>Edit</button>
          <button onClick={handleDelete} style={{ color: "red" }}>Delete Account</button>
        </div>
      )}
    </div>
  );
}