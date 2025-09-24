import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
        color: "#fff",
        padding: "0.75rem 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 2px 16px rgba(25,118,210,0.10)",
        position: "sticky",
        top: 0,
        zIndex: 200,
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "95%",
          maxWidth: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: "1.5rem",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#e3f0fc")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 48 48"
            fill="none"
            style={{ verticalAlign: "middle" }}
          >
            <circle cx="24" cy="24" r="24" fill="#fff" opacity="0.13" />
            <path
              d="M16 32v-2a6 6 0 016-6h4a6 6 0 016 6v2"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="18" r="5" stroke="#fff" strokeWidth="2" />
          </svg>
          Job Portal
        </Link>
        {/* Removed Login & Register links */}
      </div>
    </nav>
  );
}