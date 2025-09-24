import React, { useEffect, useState } from "react";
import { getUserProfile, getAllJobs, getUserApplications, userLogout, updateUserProfile, uploadResume, registerJob } from "../../api/user";
import { Link, useNavigate } from "react-router-dom";

// Simple profile icon SVG
const ProfileIcon = ({ size = 40 }) => (
  <svg height={size} width={size} viewBox="0 0 48 48" style={{ borderRadius: "50%", background: "#e3f0fc" }}>
    <circle cx="24" cy="24" r="24" fill="#e3f0fc" />
    <circle cx="24" cy="18" r="8" fill="#1976d2" />
    <ellipse cx="24" cy="36" rx="14" ry="8" fill="#1976d2" opacity="0.7" />
  </svg>
);

const styles = {
  container: {
    maxWidth: 900,
    margin: "2rem auto",
    padding: "2rem",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  profileIconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    outline: "none",
    padding: 0,
    marginLeft: 12,
  },
  section: {
    marginBottom: "2.5rem",
  },
  card: {
    background: "#f7fafd",
    borderRadius: 12,
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    marginBottom: "1.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    background: "#f7fafd",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  th: {
    background: "#e3f0fc",
    color: "#1a4e8a",
    fontWeight: 600,
    padding: "12px 8px",
    borderBottom: "2px solid #d1e3f8",
    textAlign: "left",
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid #e9ecef",
    fontSize: 15,
  },
  btn: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 15,
    transition: "background 0.2s",
  },
  btnDisabled: {
    background: "#b0bec5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    fontWeight: 500,
    fontSize: 15,
    cursor: "not-allowed",
  },
  applied: {
    color: "#43a047",
    fontWeight: 600,
  },
  input: {
    width: "80%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #b0bec5",
    marginBottom: 18,
    fontSize: 15,
    outline: "none",
    transition: "border 0.2s",
    background: "#f7fafd",
    color: "#222",
    boxShadow: "0 2px 8px rgba(25,118,210,0.07)",
    marginLeft: "auto",
    marginRight: "auto",
    display: "block",
  },
  profileBtn: {
    background: "#fff",
    color: "#1976d2",
    border: "1px solid #1976d2",
    borderRadius: 6,
    padding: "7px 16px",
    fontWeight: 500,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 8,
    transition: "background 0.2s, color 0.2s",
  },
  tabs: {
    display: "flex",
    borderBottom: "2px solid #e3f0fc",
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    padding: "10px 28px",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    fontWeight: 500,
    fontSize: 16,
    color: "#1976d2",
    transition: "border 0.2s, color 0.2s",
  },
  tabActive: {
    borderBottom: "3px solid #1976d2",
    color: "#1976d2",
    background: "#e3f0fc",
    borderRadius: "12px 12px 0 0",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.15)",
    zIndex: 1000,
  },
  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    padding: "2rem 2.5rem",
    zIndex: 1001,
    minWidth: 320,
    maxWidth: 400,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 18,
    background: "none",
    border: "none",
    fontSize: 22,
    color: "#888",
    cursor: "pointer",
  },
};

function ApplyJobModal({ job, onClose, token, onSuccess }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => setResume(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!resume) {
      setError("Please upload your resume.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload resume
      const formData = new FormData();
      formData.append("resume", resume);
      const uploadRes = await uploadResume(token, formData);
      if (!uploadRes.status) throw new Error(uploadRes.message || "Resume upload failed.");

      // 2. Register job
      const regRes = await registerJob(token, {
        jobId: job._id,
        resumePath: uploadRes.resumePath,
      });
      if (regRes.status) {
        setSuccess("Applied successfully!");
        onSuccess && onSuccess();
        setTimeout(onClose, 1200);
      } else {
        setError(regRes.message || "Failed to apply.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <>
      <div style={styles.modalOverlay} onClick={onClose} />
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose} title="Close">&times;</button>
        <h3 style={{ color: "#1976d2", marginBottom: 18, textAlign: "center" }}>
          Apply for {job.title}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Upload Resume (PDF):</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required />
          </div>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Applying..." : "Apply"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("userToken") || "");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("applied");
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const profileRes = await getUserProfile(token);
        setProfile(profileRes.data || null);

        const jobsRes = await getAllJobs(token);
        setJobs(jobsRes.jobs || []);

        const appsRes = await getUserApplications(token);
        setApplications(appsRes.data || []);
      } catch {
        setError("Failed to fetch data.");
      }
      setLoading(false);
    }
    fetchData();
  }, [token, refresh]);

  const appliedJobIds = new Set(applications.map(app => app.jobId?._id || app.jobId));
  const filteredJobs = jobs.filter(
    (job) =>
      (job.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (job.companyName?.toLowerCase() || "").includes(search.toLowerCase())
  );

  // Logout handler
  const handleLogout = async () => {
    try {
      await userLogout(token);
    } catch {}
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  // Open edit profile modal and prefill fields
  const openEditProfile = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setEditError("");
    setShowEditProfile(true);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await updateUserProfile(token, { name: editName, phone: editPhone });
      if (res.status) {
        setProfile(res.data);
        setShowEditProfile(false);
      } else {
        setEditError(res.message || "Update failed.");
      }
    } catch {
      setEditError("Network error.");
    }
    setEditLoading(false);
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 80 }}>Loading...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center", marginTop: 80 }}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ color: "#1976d2", margin: 0 }}>User Dashboard</h2>
        <button
          style={styles.profileIconBtn}
          onClick={() => setShowProfile(true)}
          title="Show Profile"
        >
          <ProfileIcon size={44} />
        </button>
      </div>

      {/* Profile Modal */}
      {showProfile && profile && (
        <>
          <div style={styles.modalOverlay} onClick={() => setShowProfile(false)} />
          <div style={styles.modal}>
            <button style={styles.closeBtn} onClick={() => setShowProfile(false)} title="Close">&times;</button>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <ProfileIcon size={60} />
            </div>
            <h3 style={{ color: "#1976d2", marginBottom: 10, textAlign: "center" }}>Profile</h3>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <button
              style={styles.profileBtn}
              onClick={() => {
                setShowProfile(false);
                openEditProfile();
              }}
            >
              View/Edit Profile
            </button>
            <button
              style={{ ...styles.profileBtn, background: "#f44336", color: "#fff", border: "none", marginTop: 16 }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <>
          <div style={styles.modalOverlay} onClick={() => setShowEditProfile(false)} />
          <div style={styles.modal}>
            <button style={styles.closeBtn} onClick={() => setShowEditProfile(false)} title="Close">&times;</button>
            <h3 style={{ color: "#1976d2", marginBottom: 18, textAlign: "center" }}>Edit Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div style={{ marginBottom: 16 }}>
                <label>Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Phone:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              {editError && <div style={{ color: "red", marginBottom: 12 }}>{editError}</div>}
              <button
                type="submit"
                style={styles.btn}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "applied" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => setActiveTab("applied")}
        >
          Applied Jobs
        </button>
        <button
          style={activeTab === "search" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          onClick={() => setActiveTab("search")}
        >
          Search & Apply
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "applied" && (
        <div style={styles.section}>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Job Title</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>No applications found.</td>
                  </tr>
                )}
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={styles.td}>{app.jobId?.title || "N/A"}</td>
                    <td style={styles.td}>{app.jobId?.company || app.jobId?.companyName || "N/A"}</td>
                    <td style={styles.td}>{app.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div style={styles.section}>
          <input
            type="text"
            placeholder="Search by job title or company"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.input}
          />
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Job Title</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Apply</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#888" }}>No jobs found.</td>
                  </tr>
                )}
                {filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td style={styles.td}>{job.title}</td>
                    <td style={styles.td}>{job.company || job.companyName}</td>
                    <td style={styles.td}>{job.location}</td>
                    <td style={styles.td}>
                      {appliedJobIds.has(job._id) ? (
                        <span style={styles.applied}>Applied</span>
                      ) : (
                        <button
                          style={styles.btn}
                          onClick={() => setApplyJob(job)}
                        >
                          Apply
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {applyJob && (
        <ApplyJobModal
          job={applyJob}
          token={token}
          onClose={() => setApplyJob(null)}
          onSuccess={() => setRefresh(r => !r)}
        />
      )}
    </div>
  );
}