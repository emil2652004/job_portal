import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1 style={{ fontSize: "3rem", color: "#1976d2" }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">
        <button style={{ padding: "10px 24px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Go to Home
        </button>
      </Link>
    </div>
  );
}