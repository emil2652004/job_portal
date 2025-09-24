import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Usage:
 * <ProtectedRoute isAllowed={isLoggedIn}><Dashboard /></ProtectedRoute>
 * - isAllowed: boolean (true if user is authenticated/authorized)
 * - children: the component(s) to render if allowed
 */
export default function ProtectedRoute({ isAllowed, children, redirectPath = "/login" }) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
}