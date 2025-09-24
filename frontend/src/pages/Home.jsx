import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  // Remove scrollbars from the whole page
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "80vh",
        width: "100vw",
        background: "linear-gradient(120deg, #e3f0fc 0%, #f9fbe7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        overflow: "hidden", // Prevents scroll on this container
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "rgba(255,255,255,0.95)",
          padding: 48,
          borderRadius: 24,
          boxShadow: "0 12px 40px rgba(25, 118, 210, 0.13)",
          textAlign: "center",
          animation: "fadeInUp 1s cubic-bezier(.23,1.01,.32,1) both",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1976d2 60%, #43a047 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px #1976d233",
              marginBottom: 0,
              animation: "popIn 0.7s cubic-bezier(.23,1.01,.32,1) both",
            }}
          >
            <svg width="38" height="38" fill="none" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="24" fill="#fff" />
              <path d="M16 32v-2a6 6 0 016-6h4a6 6 0 016 6v2" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="18" r="5" stroke="#43a047" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <h1
          style={{
            color: "#1976d2",
            fontWeight: 900,
            fontSize: "2.3rem",
            marginBottom: 12,
            letterSpacing: 1,
            textShadow: "0 2px 8px #e3f0fc",
            transition: "color 0.3s",
            fontFamily: "Segoe UI, Arial, sans-serif",
          }}
        >
          Welcome to <span style={{ color: "#43a047" }}>Job Portal</span>
        </h1>
        <p
          style={{
            color: "#444",
            fontSize: "1.13rem",
            marginBottom: 36,
            lineHeight: 1.7,
            fontWeight: 500,
            fontFamily: "Segoe UI, Arial, sans-serif",
          }}
        >
          <span style={{ color: "#1976d2", fontWeight: 700 }}>
            Find your dream job
          </span>{" "}
          or the perfect candidate.<br />
          <span style={{ color: "#43a047", fontWeight: 700 }}>
            Employers
          </span>{" "}
          can post jobs and manage applicants.<br />
          <span style={{ color: "#ff9800", fontWeight: 700 }}>Users</span> can
          register, apply for jobs, and track their applications.<br />
          <span style={{ color: "#d32f2f", fontWeight: 700 }}>Admins</span> can
          manage users, employers, and jobs.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            marginTop: 24,
          }}
        >
          <Link to="/login" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "14px 38px",
                fontSize: "1.08rem",
                background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 2px 12px rgba(25,118,210,0.13)",
                transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
                letterSpacing: 0.5,
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "linear-gradient(90deg, #1565c0 60%, #388e3c 100%)";
                e.currentTarget.style.transform = "scale(1.07)";
                e.currentTarget.style.boxShadow = "0 4px 18px #1976d244";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "linear-gradient(90deg, #1976d2 60%, #43a047 100%)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(25,118,210,0.13)";
              }}
            >
              Login
            </button>
          </Link>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "14px 38px",
                fontSize: "1.08rem",
                background: "linear-gradient(90deg, #43a047 60%, #1976d2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 2px 12px rgba(67,160,71,0.13)",
                transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
                letterSpacing: 0.5,
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "linear-gradient(90deg, #388e3c 60%, #1565c0 100%)";
                e.currentTarget.style.transform = "scale(1.07)";
                e.currentTarget.style.boxShadow = "0 4px 18px #43a04744";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "linear-gradient(90deg, #43a047 60%, #1976d2 100%)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(67,160,71,0.13)";
              }}
            >
              Register
            </button>
          </Link>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 40px, 0);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          @keyframes popIn {
            0% { transform: scale(0.7); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}