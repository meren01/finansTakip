import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: { main: '#64B5F6' },
    secondary: { main: '#42A5F5' },
    background: { default: '#E3F2FD', paper: '#FFFFFF' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
  components: {
    MuiAppBar: { styleOverrides: { colorPrimary: { backgroundColor: '#2196F3' } } },
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sayfa yüklenince token varsa bile sil → her seferinde login sayfası açılsın
  useEffect(() => {
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />

            {/* Default ve bilinmeyen path'ler login sayfasına */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
