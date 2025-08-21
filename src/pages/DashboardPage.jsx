import React, { useEffect, useState } from "react";
import { Container, Grid, Card, CardContent, Typography, Paper, Button } from "@mui/material";
import api from "../services/api"; // senin axios config dosyan

const DashboardPage = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/Dashboard/summary");
        const { totalIncome, totalExpense, balance } = res.data;

        setTotalIncome(totalIncome);
        setTotalExpense(totalExpense);
        setTotalBalance(balance);
      } catch (err) {
        console.error("Dashboard veri çekilemedi:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const cardStyle = {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    backgroundColor: "#ffffff",
    color: "#333",
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Toplam Bakiye */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyle, backgroundColor: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="h6">Toplam Bakiye</Typography>
              <Typography variant="h4">${totalBalance.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Toplam Gelir */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyle, backgroundColor: "#e8f5e9" }}>
            <CardContent>
              <Typography variant="h6">Toplam Gelir</Typography>
              <Typography variant="h5">${totalIncome.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Toplam Gider */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyle, backgroundColor: "#ffebee" }}>
            <CardContent>
              <Typography variant="h6">Toplam Gider</Typography>
              <Typography variant="h5">${totalExpense.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Linkler */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 12, backgroundColor: "#f5f5f5" }}>
            <Typography variant="h6" gutterBottom>
              Kategorileri Yönet
            </Typography>
            <Button
              href="/categories"
              variant="contained"
              sx={{ backgroundColor: "#90caf9", color: "#fff", mt: 1 }}
              fullWidth
            >
              Git
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 12, backgroundColor: "#f5f5f5" }}>
            <Typography variant="h6" gutterBottom>
              İşlemleri Yönet
            </Typography>
            <Button
              href="/transactions"
              variant="contained"
              sx={{ backgroundColor: "#a5d6a7", color: "#fff", mt: 1 }}
              fullWidth
            >
              Git
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;

