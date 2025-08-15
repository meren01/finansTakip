import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Giriş yapılmamışsa login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  return children;
}
