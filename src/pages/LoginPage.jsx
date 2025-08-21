import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Alert,
  Container,
} from "@mui/material";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/Auth/login", { email, password });
      console.log("Login response:", res.data);

      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token); // sessionStorage kullan
        onLogin(); // parent state'i güncelle
        navigate("/dashboard", { replace: true });
      } else {
        setError("Token alınamadı.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Giriş başarısız oldu.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center", mt: 8 }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Giriş Yap
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Giriş Yap
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
