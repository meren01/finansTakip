import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { ArrowUpward, ArrowDownward, AccountBalance } from "@mui/icons-material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../services/api";

// Renk paleti
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A569BD", "#E74C3C", "#FF69B4", "#CD853F",
  "#7FFF00", "#1E90FF",
];

const DashboardPage = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [maxIncomeCategory, setMaxIncomeCategory] = useState(null);
  const [maxExpenseCategory, setMaxExpenseCategory] = useState(null);

  // Binlik ayırıcı için formatlayıcı
  const formatCurrency = (num) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

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

  // Dinamik kart renkleri
  const balanceBg =
    totalBalance >= 0
      ? "linear-gradient(135deg, #66bb6a, #43a047)" // Yeşil
      : "linear-gradient(135deg, #ef5350, #e53935)"; // Kırmızı

  const cardData = [
    {
      title: "Toplam Bakiye",
      value: `$${formatCurrency(totalBalance)}`,
      icon: <AccountBalance sx={{ fontSize: 40, color: "#fff" }} />,
      bg: balanceBg,
    },
    {
      title: "Toplam Gelir",
      value: `$${formatCurrency(totalIncome)}`,
      icon: <ArrowUpward sx={{ fontSize: 40, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #66bb6a, #43a047)",
    },
    {
      title: "Toplam Gider",
      value: `$${formatCurrency(totalExpense)}`,
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

      {/* Gelir ve Gider PieChart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Gelir */}
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
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`inc-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography>Gelir verisi bulunamadı.</Typography>
            )}
            {maxIncomeCategory && (
              <Typography sx={{ mt: 1 }}>
                En yüksek gelir: {maxIncomeCategory.CategoryName} (${formatCurrency(maxIncomeCategory.Total)})
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Gider */}
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
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`exp-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography>Gider verisi bulunamadı.</Typography>
            )}
            {maxExpenseCategory && (
              <Typography sx={{ mt: 1 }}>
                En yüksek gider: {maxExpenseCategory.CategoryName} (${formatCurrency(maxExpenseCategory.Total)})
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;

