import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  AccountBalance,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

// Renk paleti
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#E74C3C",
  "#FF69B4",
  "#CD853F",
  "#7FFF00",
  "#1E90FF",
];

const DashboardPage = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [maxIncomeCategory, setMaxIncomeCategory] = useState(null);
  const [maxExpenseCategory, setMaxExpenseCategory] = useState(null);

  // Özet verileri çek
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/Dashboard/summary");
        const d = res.data || {};
        const ti = d.totalIncome ?? d.TotalIncome ?? d.total_income ?? 0;
        const te = d.totalExpense ?? d.TotalExpense ?? d.total_expense ?? 0;
        const bal = d.balance ?? d.Balance ?? (ti - te);
        setTotalIncome(ti);
        setTotalExpense(te);
        setTotalBalance(bal);
      } catch (err) {
        console.error("Dashboard summary çekilemedi:", err);
      }
    };
    fetchSummary();
  }, []);

  // Kategori bazlı gelir/gider
  useEffect(() => {
    const fetchCategorySummary = async () => {
      try {
        const res = await api.get("/Dashboard/category-summary");

        const normalize = (arr) =>
          (arr || []).map((x) => ({
            CategoryName: x.CategoryName ?? x.categoryName ?? x.name ?? "Bilinmeyen",
            Total: x.Total ?? x.total ?? x.amount ?? 0,
          }));

        const income = normalize(res.data?.income);
        const expense = normalize(res.data?.expense);
        setIncomeData(income);
        setExpenseData(expense);

        if (income.length > 0) {
          const maxInc = income.reduce((a, b) => (a.Total > b.Total ? a : b));
          setMaxIncomeCategory(maxInc);
        }
        if (expense.length > 0) {
          const maxExp = expense.reduce((a, b) => (a.Total > b.Total ? a : b));
          setMaxExpenseCategory(maxExp);
        }
      } catch (err) {
        console.error("Kategori bazlı veri çekilemedi:", err);
      }
    };
    fetchCategorySummary();
  }, []);

  const cardData = [
    {
      title: "Toplam Bakiye",
      value: `$${totalBalance.toFixed(2)}`,
      icon: <AccountBalance sx={{ fontSize: 40, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #42a5f5, #478ed1)",
    },
    {
      title: "Toplam Gelir",
      value: `$${totalIncome.toFixed(2)}`,
      icon: <ArrowUpward sx={{ fontSize: 40, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #66bb6a, #43a047)",
    },
    {
      title: "Toplam Gider",
      value: `$${totalExpense.toFixed(2)}`,
      icon: <ArrowDownward sx={{ fontSize: 40, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #ef5350, #e53935)",
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      {/* Özet Kartlar */}
      <Grid container spacing={3}>
        {cardData.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                background: card.bg,
                color: "#fff",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* PieChart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>Gelir Dağılımı</Typography>
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    dataKey="Total"
                    nameKey="CategoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.CategoryName} (${entry.Total})`}
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`inc-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography>Gelir verisi bulunamadı.</Typography>
            )}
            {maxIncomeCategory && (
              <Typography sx={{ mt: 1 }}>
                En yüksek gelir: {maxIncomeCategory.CategoryName} (${maxIncomeCategory.Total})
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>Gider Dağılımı</Typography>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    dataKey="Total"
                    nameKey="CategoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.CategoryName} (${entry.Total})`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`exp-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography>Gider verisi bulunamadı.</Typography>
            )}
            {maxExpenseCategory && (
              <Typography sx={{ mt: 1 }}>
                En yüksek gider: {maxExpenseCategory.CategoryName} (${maxExpenseCategory.Total})
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
