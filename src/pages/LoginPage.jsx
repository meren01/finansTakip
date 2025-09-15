import React, { useState } from "react";
// useNavigate'i import etmeye gerek kalmayacak, çünkü artık yönlendirme işlemi App.jsx'te yapılıyor.
import api from "../services/api";
import { Button, TextField, Typography, Box, Paper, Alert, Container } from "@mui/material";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/Auth/login", { email, password });
      const token = res.data?.token;

      if (!token) {
        setError("Giriş başarısız: Token alınamadı.");
        return;
      }

      // Başarılı token'ı App.jsx'teki onLogin fonksiyonuna gönderiyoruz.
      // Bu çağrı, App.jsx'teki isAuthenticated ve user state'lerini güncelleyecek.
      onLogin(token); 

    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        "Giriş başarısız oldu.";
      setError(message);
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
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}
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