import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployerList,
  getUserList,
  deleteEmployer,
  deleteUser,
  generateEmployerListPdf,
  generateUserListPdf,
  getAllJobs,
} from "../../api/admin";

export default function AdminDashboard() {
  const [employers, setEmployers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");
  const [error, setError] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [pdfLoading, setPdfLoading] = useState({ employer: false, user: false });
  const [pdfMsg, setPdfMsg] = useState({ employer: "", user: "" });
  const [snackbar, setSnackbar] = useState({ show: false, message: "", color: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      if (!token) {
        setError("You are not logged in as admin.");
        setLoading(false);
        return;
      }
      try {
        const employerRes = await getEmployerList(token);
        if (!employerRes || employerRes.status === false) {
          setError(employerRes?.message || "Failed to fetch employers");
          setLoading(false);
          return;
        }
        setEmployers(employerRes.data || []);

        const userRes = await getUserList(token);
        if (!userRes || userRes.status === false) {
          setError(userRes?.message || "Failed to fetch users");
          setLoading(false);
          return;
        }
        setUsers(userRes.data || []);

        const jobsRes = await getAllJobs(token);
        if (jobsRes && jobsRes.status !== false) {
          setAllJobs(jobsRes.data || []);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      }
      setLoading(false);
    }
    fetchData();
  }, [token]);

  const handleDeleteEmployer = async (id) => {
    if (!window.confirm("Delete this employer?")) return;
    await deleteEmployer(id, token);
    setEmployers(employers.filter(emp => emp._id !== id));
    setSnackbar({ show: true, message: "Employer deleted.", color: "#43a047" });
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(id, token);
    setUsers(users.filter(u => u._id !== id));
    setSnackbar({ show: true, message: "User deleted.", color: "#43a047" });
  };

  const handleShowEmployerJobs = (employer) => {
    setSelectedEmployer(employer);
    setJobsLoading(true);
    const jobs = allJobs.filter(job =>
      (job.postedBy && job.postedBy._id === employer._id) ||
      job.postedBy === employer._id
    );
    setEmployerJobs(jobs);
    setJobsLoading(false);
  };

  const handleCloseJobsModal = () => {
    setSelectedEmployer(null);
    setEmployerJobs([]);
  };

  const handleGenerateEmployerPdf = async () => {
    setPdfLoading((prev) => ({ ...prev, employer: true }));
    setPdfMsg((prev) => ({ ...prev, employer: "" }));
    try {
      const res = await generateEmployerListPdf(token);
      setPdfMsg((prev) => ({
        ...prev,
        employer: res.message || "PDF sent to admin email.",
      }));
      if (res.employers) setEmployers(res.employers);
      setSnackbar({ show: true, message: "Employer PDF sent!", color: "#1976d2" });
    } catch (err) {
      setPdfMsg((prev) => ({
        ...prev,
        employer: "Failed to generate/send PDF.",
      }));
      setSnackbar({ show: true, message: "Failed to generate employer PDF.", color: "#f44336" });
    }
    setPdfLoading((prev) => ({ ...prev, employer: false }));
  };

  const handleGenerateUserPdf = async () => {
    setPdfLoading((prev) => ({ ...prev, user: true }));
    setPdfMsg((prev) => ({ ...prev, user: "" }));
    try {
      const res = await generateUserListPdf(token);
      setPdfMsg((prev) => ({
        ...prev,
        user: res.message || "PDF sent to admin email.",
      }));
      setSnackbar({ show: true, message: "User PDF sent!", color: "#1976d2" });
    } catch (err) {
      setPdfMsg((prev) => ({
        ...prev,
        user: "Failed to generate/send PDF.",
      }));
      setSnackbar({ show: true, message: "Failed to generate user PDF.", color: "#f44336" });
    }
    setPdfLoading((prev) => ({ ...prev, user: false }));
  };

  const closeSnackbar = () => setSnackbar({ show: false, message: "", color: "" });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login"); // or "/admin/login" if that's your admin login route
  };

  if (loading)
    return (
      <div className="admindash-loading">
        <div className="admindash-spinner"></div>
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="admindash-error">
        {error}
      </div>
    );

  return (
    <div className="admindash-root">
      <div className="admindash-header-bar">
        <h2 className="admindash-title">Admin Dashboard</h2>
        <button className="admindash-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="admindash-section-group">
        {/* Employers Section */}
        <div className="admindash-section-card">
          <div className="admindash-section-header">
            <h3>Employers</h3>
            <button
              className="admindash-pdf-btn"
              onClick={handleGenerateEmployerPdf}
              disabled={pdfLoading.employer}
            >
              {pdfLoading.employer ? "Generating PDF..." : "Generate PDF"}
            </button>
          </div>
          {pdfMsg.employer && (
            <div className="admindash-msg admindash-msg-success">{pdfMsg.employer}</div>
          )}
          <div className="admindash-table-wrap">
            <table className="admindash-table">
              <thead>
                <tr>
                  <th style={{ width: "22%", textAlign: "left" }}>Name</th>
                  <th style={{ width: "38%", textAlign: "left" }}>Email</th>
                  <th style={{ width: "20%", textAlign: "left" }}>Phone</th>
                  <th style={{ width: "20%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="admindash-empty">No employers found.</td>
                  </tr>
                ) : (
                  employers.map(emp => (
                    <tr key={emp._id} className="admindash-row">
                      <td>
                        <span
                          className="admindash-link"
                          onClick={() => handleShowEmployerJobs(emp)}
                          title="Show all jobs by this employer"
                        >
                          {emp.name}
                        </span>
                      </td>
                      <td style={{ textAlign: "left" }}>{emp.email}</td>
                      <td style={{ textAlign: "left" }}>{emp.phone || "N/A"}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="admindash-delete-btn"
                          onClick={() => handleDeleteEmployer(emp._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Section */}
        <div className="admindash-section-card">
          <div className="admindash-section-header">
            <h3>Users</h3>
            <button
              className="admindash-pdf-btn"
              onClick={handleGenerateUserPdf}
              disabled={pdfLoading.user}
            >
              {pdfLoading.user ? "Generating PDF..." : "Generate PDF"}
            </button>
          </div>
          {pdfMsg.user && (
            <div className="admindash-msg admindash-msg-success">{pdfMsg.user}</div>
          )}
          <div className="admindash-table-wrap">
            <table className="admindash-table">
              <thead>
                <tr>
                  <th style={{ width: "22%", textAlign: "left" }}>Name</th>
                  <th style={{ width: "38%", textAlign: "left" }}>Email</th>
                  <th style={{ width: "20%", textAlign: "left" }}>Phone</th>
                  <th style={{ width: "20%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="admindash-empty">No users found.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="admindash-row">
                      <td>{u.name}</td>
                      <td style={{ textAlign: "left" }}>{u.email}</td>
                      <td style={{ textAlign: "left" }}>{u.phone || "N/A"}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="admindash-delete-btn"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employer Jobs Modal */}
      {selectedEmployer && (
        <div className="admindash-modal-bg" onClick={handleCloseJobsModal}>
          <div className="admindash-modal" onClick={e => e.stopPropagation()}>
            <h3>Jobs posted by {selectedEmployer.name}</h3>
            {jobsLoading ? (
              <div className="admindash-loading">Loading jobs...</div>
            ) : employerJobs.length === 0 ? (
              <div className="admindash-empty">No jobs found for this employer.</div>
            ) : (
              <table className="admindash-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Date Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {employerJobs.map(job => (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td>{job.location}</td>
                      <td>
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="admindash-close-btn" onClick={handleCloseJobsModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.show && (
        <div
          className="admindash-snackbar"
          style={{ background: snackbar.color }}
          onClick={closeSnackbar}
        >
          {snackbar.message}
        </div>
      )}

      {/* Styles */}
      <style>{`
        .admindash-root {
          max-width: 1100px;
          margin: 2rem auto;
          padding: 2.5rem;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(25,118,210,0.10);
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .admindash-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .admindash-title {
          color: #1976d2;
          letter-spacing: 1px;
          margin: 0;
        }
        .admindash-logout-btn {
          background: #f44336;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 24px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 2px 8px #f4433622;
          transition: background 0.2s;
        }
        .admindash-logout-btn:hover {
          background: #d32f2f;
        }
        .admindash-section-group {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .admindash-section-card {
          background: #f9fbff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(25,118,210,0.07);
          padding: 32px 24px 24px 24px;
          margin: 0 auto;
          width: 100%;
          max-width: 950px;
        }
        .admindash-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .admindash-section-header h3 {
          color: #1976d2;
          font-size: 1.35rem;
          font-weight: 700;
          margin: 0;
        }
        .admindash-pdf-btn {
          background: linear-gradient(90deg, #1976d2 60%, #43a047 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 22px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 2px 8px #1976d222;
          transition: background 0.2s;
        }
        .admindash-pdf-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .admindash-table-wrap {
          overflow-x: auto;
          background: #eaf4fd;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-top: 10px;
        }
        .admindash-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #eaf4fd;
          border-radius: 12px;
          overflow: hidden;
        }
        .admindash-table th {
          background: #d6eaff;
          color: #1a4e8a;
          font-weight: 600;
          padding: 12px 8px;
          border-bottom: 2px solid #b8d8f8;
          text-align: left;
        }
        .admindash-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #e9ecef;
          font-size: 15px;
        }
        .admindash-table th,
        .admindash-table td {
          vertical-align: middle;
        }
        .admindash-table th:last-child,
        .admindash-table td:last-child {
          text-align: center !important;
        }
        .admindash-row:hover {
          background: #d6eaff;
          transition: background 0.2s;
        }
        .admindash-link {
          color: #1976d2;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 500;
        }
        .admindash-delete-btn {
          background: #f44336;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 18px;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .admindash-delete-btn:hover {
          background: #d32f2f;
        }
        .admindash-empty {
          text-align: center;
          color: #888;
          padding: 18px 0;
          font-size: 16px;
          background: #eaf4fd;
        }
        .admindash-msg {
          margin-bottom: 10px;
          font-weight: 500;
        }
        .admindash-msg-success {
          color: #388e3c;
        }
        .admindash-modal-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.2);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admindash-modal {
          background: #fff;
          border-radius: 12px;
          padding: 32px;
          min-width: 400px;
          max-width: 600px;
          box-shadow: 0 4px 24px rgba(25,118,210,0.10);
          position: relative;
        }
        .admindash-close-btn {
          margin-top: 18px;
          background: #1976d2;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .admindash-close-btn:hover {
          background: #1251a3;
        }
        .admindash-loading {
          text-align: center;
          margin-top: 80px;
          font-size: 20px;
          color: #1976d2;
        }
        .admindash-spinner {
          border: 4px solid #e3f0fc;
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: admindash-spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }
        @keyframes admindash-spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .admindash-error {
          color: #f44336;
          text-align: center;
          margin-top: 80px;
          font-size: 20px;
        }
        .admindash-snackbar {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 2000;
          cursor: pointer;
          transition: opacity 0.3s;
        }
      `}</style>
    </div>
  );
}
