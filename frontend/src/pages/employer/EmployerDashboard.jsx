import React, { useEffect, useState } from "react";
import { getEmployerProfile, getJobList, employerLogout, postJob, getRegisteredUsersForJobs, updateEmployerProfile } from "../../api/employer";

// Simple profile icon SVG
const ProfileIcon = ({ size = 40 }) => (
  <svg height={size} width={size} viewBox="0 0 48 48" style={{ borderRadius: "50%", background: "#e3f0fc" }}>
    <circle cx="24" cy="24" r="24" fill="#e3f0fc" />
    <circle cx="24" cy="18" r="8" fill="#1976d2" />
    <ellipse cx="24" cy="36" rx="14" ry="8" fill="#1976d2" opacity="0.7" />
  </svg>
);

export default function EmployerDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("employerToken") || "");
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    jobType: "",
  });
  const [jobError, setJobError] = useState("");
  const [jobLoading, setJobLoading] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const profileRes = await getEmployerProfile(token);
        setProfile(profileRes.user || null);

        const jobsRes = await getJobList(token);
        setJobs(jobsRes.jobs || []);
      } catch (err) {
        setError("Failed to fetch employer data.");
      }
      setLoading(false);
    }
    fetchData();
  }, [token]);

  // When profile is loaded, sync editForm
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await employerLogout(token);
    } catch {}
    localStorage.removeItem("employerToken");
    window.location.href = "/login";
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setJobError("");
    setJobLoading(true);
    if (
      !jobForm.title ||
      !jobForm.description ||
      !jobForm.company ||
      !jobForm.location ||
      !jobForm.salary ||
      !jobForm.jobType
    ) {
      setJobError("All fields are required.");
      setJobLoading(false);
      return;
    }
    try {
      const res = await postJob(token, jobForm);
      if (res.status) {
        setJobs((prev) => [...prev, res.job]);
        setShowAddJob(false);
        setJobForm({
          title: "",
          description: "",
          company: "",
          location: "",
          salary: "",
          jobType: "",
        });
      } else {
        setJobError(res.message || "Failed to post job.");
      }
    } catch {
      setJobError("Network error.");
    }
    setJobLoading(false);
  };

  const handleShowUsers = async () => {
    setShowUsers(true);
    setLoading(true);
    try {
      const res = await getRegisteredUsersForJobs(token);
      if (res.status) setUsers(res.data || []);
      else setUsers([]);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    try {
      const res = await updateEmployerProfile(token, editForm);
      if (res.status) {
        setProfileMsg("Profile updated successfully.");
        setProfile((prev) => ({ ...prev, ...editForm }));
        setEditProfile(false);
      } else {
        setProfileErr(res.message || "Failed to update profile.");
      }
    } catch {
      setProfileErr("Network error.");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 80, fontSize: 20 }}>
        Loading...
      </div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 80 }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        padding: "2rem",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <h2 style={{ color: "#1976d2", margin: 0 }}>Employer Dashboard</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            title="Profile"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 28,
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => setShowProfile(true)}
          >
            <ProfileIcon size={38} />
          </button>
          <button
            title="Add Job"
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={() => setShowAddJob(true)}
          >
            + Add Job
          </button>
          <button
            title="Registered Users"
            style={{
              background: "#2196f3",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={handleShowUsers}
          >
            Registered Users
          </button>
          <button
            style={{
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer",
              marginLeft: 12,
              transition: "background 0.2s",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && profile && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}
          onClick={() => setShowProfile(false)}
        >
          <div style={{
            background: "#fff", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(25,118,210,0.10)"
          }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: "#1976d2", marginBottom: 18, textAlign: "center" }}>Profile</h3>
            {editProfile ? (
              <form onSubmit={handleProfileEdit}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, color: "#1976d2" }}>Name:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: 8,
                      marginTop: 4,
                      borderRadius: 6,
                      border: "1px solid #b0bec5",
                      fontSize: 15,
                    }}
                  />
                </div>
        
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, color: "#1976d2" }}>Phone:</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: 8,
                      marginTop: 4,
                      borderRadius: 6,
                      border: "1px solid #b0bec5",
                      fontSize: 15,
                    }}
                  />
                </div>
                {profileErr && <div style={{ color: "red", marginBottom: 8 }}>{profileErr}</div>}
                {profileMsg && <div style={{ color: "green", marginBottom: 8 }}>{profileMsg}</div>}
                <button
                  type="submit"
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                    marginRight: 8,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  style={{
                    background: "#b0bec5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={() => setEditProfile(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
                <button
                  style={{
                    marginTop: 18,
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                    marginRight: 8,
                  }}
                  onClick={() => setEditProfile(true)}
                >
                  Edit
                </button>
                <button
                  style={{
                    marginTop: 18,
                    background: "#b0bec5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJob && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}
          onClick={() => setShowAddJob(false)}
        >
          <div style={{
            background: "#fff", borderRadius: 12, padding: 32, minWidth: 340, boxShadow: "0 4px 24px rgba(25,118,210,0.10)"
          }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: "#1976d2", marginBottom: 18, textAlign: "center" }}>Add New Job</h3>
            <form onSubmit={handleAddJob}>
              <input
                type="text"
                placeholder="Job Title"
                value={jobForm.title}
                onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #b0bec5",
                  fontSize: 14,
                  background: "#f7fafd",
                  color: "#222",
                  fontWeight: 500,
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(25,118,210,0.05)",
                }}
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={jobForm.company}
                onChange={e => setJobForm({ ...jobForm, company: e.target.value })}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #b0bec5",
                  fontSize: 14,
                  background: "#f7fafd",
                  color: "#222",
                  fontWeight: 500,
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(25,118,210,0.05)",
                }}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={jobForm.location}
                onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #b0bec5",
                  fontSize: 14,
                  background: "#f7fafd",
                  color: "#222",
                  fontWeight: 500,
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(25,118,210,0.05)",
                }}
                required
              />
              <input
                type="text"
                placeholder="Salary"
                value={jobForm.salary}
                onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #b0bec5",
                  fontSize: 14,
                  background: "#f7fafd",
                  color: "#222",
                  fontWeight: 500,
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(25,118,210,0.05)",
                }}
                required
              />
              <select
                value={jobForm.jobType}
                onChange={e => setJobForm({ ...jobForm, jobType: e.target.value })}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #b0bec5",
                  fontSize: 14,
                  background: "#f7fafd",
                  color: "#1976d2",
                  fontWeight: 600,
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(25,118,210,0.05)",
                  appearance: "none",
                }}
                required
              >
                <option value="" style={{ color: "#888" }}>Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
              <textarea
                placeholder="Description"
                value={jobForm.description}
                onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                style={{
                  width: "100%",
                  marginBottom: 12,
                  padding: "7px 10px",
                  minHeight: 50,
                  borderRadius: 6,
                  border: "1px solid #b0bec5",
                  fontSize: 14,
                  background: "#f7fafd",
                  color: "#222",
                  fontWeight: 500,
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(25,118,210,0.05)",
                  resize: "vertical",
                }}
                required
              />
              {jobError && <div style={{ color: "red", marginBottom: 8, fontSize: 13 }}>{jobError}</div>}
              <button
                type="submit"
                disabled={jobLoading}
                style={{
                  background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 0",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: jobLoading ? "not-allowed" : "pointer",
                  marginTop: 6,
                  width: "100%",
                  boxShadow: "0 1px 6px rgba(25,118,210,0.10)",
                  letterSpacing: 0.5,
                  transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "linear-gradient(90deg, #1565c0 60%, #388e3c 100%)";
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 2px 8px #1976d244";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "linear-gradient(90deg, #1976d2 60%, #43a047 100%)";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 6px rgba(25,118,210,0.10)";
                }}
              >
                {jobLoading ? "Posting..." : "Post Job"}
              </button>
              <button
                type="button"
                style={{
                  marginTop: 8,
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 0",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  width: "100%",
                  boxShadow: "0 1px 6px rgba(244,67,54,0.10)",
                  letterSpacing: 0.5,
                  transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                onClick={() => setShowAddJob(false)}
                onMouseOver={e => {
                  e.currentTarget.style.background = "#c62828";
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 2px 8px #c6282844";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "#f44336";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 6px rgba(244,67,54,0.10)";
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registered Users Modal */}
      {showUsers && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}
          onClick={() => setShowUsers(false)}
        >
          <div style={{
            background: "#fff", borderRadius: 12, padding: 32, minWidth: 340, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(25,118,210,0.10)"
          }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: "#1976d2", marginBottom: 18, textAlign: "center" }}>Registered Users</h3>
            {users.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center" }}>No users registered for your jobs.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #e0e0e0", padding: 8 }}>Name</th>
                    <th style={{ borderBottom: "1px solid #e0e0e0", padding: 8 }}>Email</th>
                    <th style={{ borderBottom: "1px solid #e0e0e0", padding: 8 }}>Phone</th>
                    <th style={{ borderBottom: "1px solid #e0e0e0", padding: 8 }}>Job Title</th>
                    <th style={{ borderBottom: "1px solid #e0e0e0", padding: 8 }}>Applied At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 8 }}>{item.user?.name || ""}</td>
                      <td style={{ padding: 8 }}>{item.user?.email || ""}</td>
                      <td style={{ padding: 8 }}>{item.user?.phone || ""}</td>
                      <td style={{ padding: 8 }}>{item.job?.title || ""}</td>
                      <td style={{ padding: 8 }}>
                        {item.appliedAt
                          ? new Date(item.appliedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              style={{
                marginTop: 18, background: "#1976d2", color: "#fff", border: "none",
                borderRadius: 6, padding: "8px 18px", fontWeight: 500, fontSize: 15, cursor: "pointer"
              }}
              onClick={() => setShowUsers(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <h3 style={{ color: "#1a4e8a", marginBottom: 12 }}>Your Posted Jobs</h3>
      <div
        style={{
          background: "#f7fafd",
          borderRadius: 12,
          padding: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            background: "#f7fafd",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#e3f0fc",
                  color: "#1a4e8a",
                  fontWeight: 600,
                  padding: "12px 8px",
                  borderBottom: "2px solid #d1e3f8",
                  textAlign: "left",
                }}
              >
                Title
              </th>
              <th
                style={{
                  background: "#e3f0fc",
                  color: "#1a4e8a",
                  fontWeight: 600,
                  padding: "12px 8px",
                  borderBottom: "2px solid #d1e3f8",
                  textAlign: "left",
                }}
              >
                Location
              </th>
              <th
                style={{
                  background: "#e3f0fc",
                  color: "#1a4e8a",
                  fontWeight: 600,
                  padding: "12px 8px",
                  borderBottom: "2px solid #d1e3f8",
                  textAlign: "left",
                }}
              >
                Date Posted
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>
                  No jobs posted yet.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job._id}>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e9ecef" }}>
                  {job.title}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e9ecef" }}>
                  {job.location}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e9ecef" }}>
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}