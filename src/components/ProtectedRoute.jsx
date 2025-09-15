import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, isAdminRoute = false, isAdmin, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdminRoute && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
