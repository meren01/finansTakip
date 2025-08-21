import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token"); // her sayfa yüklenişinde kontrol

  if (!token) {
    return <Navigate to="/login" replace />; // token yoksa login sayfasına
  }

  return children;
}
