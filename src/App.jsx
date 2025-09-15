import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import TransactionsPage from "./pages/TransactionsPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Vite uyumlu jwt-decode importu
import { jwtDecode } from "jwt-decode";

const theme = createTheme({
  palette: {
    primary: { main: "#64B5F6" },
    secondary: { main: "#42a4f590" },
    background: { default: "#E3F2FD", paper: "#FFFFFF" },
  },
  typography: { fontFamily: "Roboto, sans-serif" },
});

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Ortak rol okuma fonksiyonu
  const getUserRole = (decoded) => {
    return (
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      "User"
    );
  };

  // Token kontrolü ve sayfa yönlendirme
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = getUserRole(decoded);

        setUser({ userName: decoded.name || decoded.unique_name, role: userRole });
        setIsAuthenticated(true);

        if (userRole === "Admin" && window.location.pathname === "/") {
          navigate("/admin", { replace: true });
        } else if (window.location.pathname === "/") {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Token decode error:", err);
        sessionStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, [navigate]);

  const handleLogin = (token) => {
    if (!token) return;
    sessionStorage.setItem("token", token);
    try {
      const decoded = jwtDecode(token);
      console.log("Token içeriği:", decoded);

      const userRole = getUserRole(decoded);
      console.log("Kullanıcı rolü:", userRole);

      setUser({ userName: decoded.name || decoded.unique_name, role: userRole });
      setIsAuthenticated(true);

      if (userRole === "Admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Token decode error:", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        isAdmin={user?.role === "Admin"}
        onLogout={handleLogout}
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {user?.role === "Admin" ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Container>
    </>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;
