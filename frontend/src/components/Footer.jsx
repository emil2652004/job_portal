import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
        color: "#fff",
        textAlign: "center",
        padding: "0.9rem 0 1rem 0",
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        zIndex: 100,
        boxShadow: "0 -2px 16px rgba(25,118,210,0.10)",
        fontFamily: "Segoe UI, Arial, sans-serif",
        letterSpacing: 0.5,
        fontWeight: 500,
        fontSize: "1.08rem",
        transition: "background 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none" style={{ verticalAlign: "middle" }}>
          <circle cx="24" cy="24" r="24" fill="#fff" opacity="0.13" />
          <path d="M16 32v-2a6 6 0 016-6h4a6 6 0 016 6v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="18" r="5" stroke="#fff" strokeWidth="2" />
        </svg>
        <span>
          &copy; {new Date().getFullYear()} <span style={{ fontWeight: 700, color: "#fff" }}>Job Portal</span>. All rights reserved.
        </span>
      </div>
    </footer>
  );
}