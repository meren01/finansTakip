import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ Doğru

import { Button, TextField, Typography, Box, Paper, Alert, Container } from "@mui/material";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/Auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Kayıt başarısız oldu.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center", mt: 8 }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Kayıt Ol
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField fullWidth label="Ad Soyad" margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth label="E-posta" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth label="Şifre" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>Kayıt Ol</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
