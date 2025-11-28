import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  TextField,
  Button,
  Divider,
  Stack
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  AccountBalance,
  SwapHoriz,
  CurrencyExchange,
  Settings
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar,
  Brush,
} from "recharts";
import api from "../services/api";

const PIE_COLORS = [
  "#FFB300", "#26C6DA", "#FFA726", "#EF5350", "#AB47BC",
  "#42A5F5", "#26A69A", "#D4E157", "#FF7043", "#8D6E63", "#78909C"
];

// Sabit renk üretici
const getCategoryColor = (categoryName) => {
  if (!categoryName) return "#ccc";
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % PIE_COLORS.length);
  return PIE_COLORS[index];
};

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    currency: "TRY",
  });

  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  
  const [exchangeRates, setExchangeRates] = useState({
    USD: 0, EUR: 0, GBP: 0,
  });
  
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");

  // Widget State
  const [widgetFrom, setWidgetFrom] = useState("USD");
  const [widgetTo, setWidgetTo] = useState("TRY");
  const [widgetAmount, setWidgetAmount] = useState("");
  const [widgetResult, setWidgetResult] = useState(null);

  // Formatlayıcı
  const formatCurrency = (n) =>
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(n) ? 0 : n);

  // Çevirici
  const convertFromTRY = (tlValue) => {
    if (!tlValue || isNaN(tlValue)) return 0;
    if (selectedCurrency === "TRY") return tlValue;

    const rate = exchangeRates[selectedCurrency];
    if (!rate || rate <= 0) return tlValue;

    return tlValue / rate;
  };

  useEffect(() => {
    // 1) Dashboard summary
    (async () => {
      try {
        const res = await api.get("/dashboard/summary");
        const d = res.data || {};
        const normalized = {
          totalIncome: d.totalIncome ?? d.TotalIncome ?? 0,
          totalExpense: d.totalExpense ?? d.TotalExpense ?? 0,
          balance: d.balance ?? d.Balance ?? 
                   ((d.totalIncome ?? d.TotalIncome ?? 0) - (d.totalExpense ?? d.TotalExpense ?? 0)),
          currency: d.currency ?? d.Currency ?? "TRY",
        };
        setSummary(normalized);
      } catch (err) {
        console.error("Summary error:", err);
      }
    })();

    // 2) Kategori verileri
    (async () => {
      try {
        const res = await api.get("/dashboard/category-summary");
        const d = res.data || {};
        const mapData = (arr) => (arr || []).map(x => ({
             category: x.categoryName ?? x.CategoryName ?? "Diğer",
             value: x.total ?? x.Total ?? 0
        }));

        setIncomeData(mapData(d.income ?? d.Income));
        setExpenseData(mapData(d.expense ?? d.Expense));
      } catch (err) {
        console.error("Category error:", err);
      }
    })();

    // 3) Kurlar
    (async () => {
      try {
        const res = await api.get("/Currency/latest");
        const data = res.data; 
        const rates = {
          USD: data.usd || data.USD || 0,
          EUR: data.eur || data.EUR || 0,
          GBP: data.gbp || data.GBP || 0,
        };
        setExchangeRates(rates);
      } catch (err) { console.error("Kur hatası:", err); }
    })();
  }, []);

  // Histogram Verisi
  const histogramData = useMemo(() => {
    const allCategories = Array.from(new Set([...incomeData, ...expenseData].map((x) => x.category)));
    
    const data = allCategories.map((cat) => {
      const inc = incomeData.find((x) => x.category === cat);
      const exp = expenseData.find((x) => x.category === cat);
      return {
        category: cat,
        income: convertFromTRY(inc?.value ?? 0),
        expense: convertFromTRY(exp?.value ?? 0),
      };
    });

    return data.filter(i => i.income > 0 || i.expense > 0);
  }, [incomeData, expenseData, selectedCurrency, exchangeRates]);

  // Pie Chart Verileri
  const incomePie = useMemo(() => incomeData.map(x => ({ name: x.category, value: convertFromTRY(x.value) })), [incomeData, selectedCurrency, exchangeRates]);
  const expensePie = useMemo(() => expenseData.map(x => ({ name: x.category, value: convertFromTRY(x.value) })), [expenseData, selectedCurrency, exchangeRates]);

  // Kartlar
  const convertedBalance = convertFromTRY(summary.balance);
  const cardData = [
    {
      title: "Toplam Bakiye",
      value: `${formatCurrency(convertedBalance)} ${selectedCurrency}`,
      icon: <AccountBalance sx={{ fontSize: 40, color: "#fff", opacity: 0.8 }} />,
      bg: convertedBalance >= 0 
          ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" // Modern Yeşil Gradient
          : "linear-gradient(135deg, #f43f3fff 0%, #E11D48 100%)", // Modern Kırmızı Gradient
    },
    {
      title: "Toplam Gelir",
      value: `${formatCurrency(convertFromTRY(summary.totalIncome))} ${selectedCurrency}`,
      icon: <ArrowUpward sx={{ fontSize: 40, color: "#fff", opacity: 0.8 }} />,
      bg: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", // Modern Mavi
    },
    {
      title: "Toplam Gider",
      value: `${formatCurrency(convertFromTRY(summary.totalExpense))} ${selectedCurrency}`,
      icon: <ArrowDownward sx={{ fontSize: 40, color: "#fff", opacity: 0.8 }} />,
      bg: "linear-gradient(135deg, #d51818ff 0%, #ef1818ff 100%)", // Modern Turuncu
    },
  ];

  // Widget Hesaplama
  const calculateWidget = () => {
    const amount = parseFloat(widgetAmount);
    if (isNaN(amount) || !exchangeRates.USD) return; 

    let result = amount;
    if (widgetFrom !== "TRY") result = amount * (exchangeRates[widgetFrom] || 0);
    if (widgetTo !== "TRY") {
      const rate = exchangeRates[widgetTo];
      result = rate > 0 ? result / rate : 0;
    }
    setWidgetResult(result);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Finansal Özet
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
           <Settings color="action" />
           <Typography variant="body2" color="text.secondary">Dashboard Birimi:</Typography>
           <TextField
              select size="small" value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              sx={{ width: 100 }} variant="outlined"
            >
              {["TRY","USD","EUR","GBP"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
        </Box>
      </Box>

      {/* Kartlar */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardData.map((c, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ background: c.bg, color: "#fff", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", "&:hover": { transform: "translateY(-4px)", transition: "0.2s" } }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1 }}>{c.title}</Typography>
                    <Typography variant="h4" fontWeight="bold">{c.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)" }}>{c.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Grafikler Sol (8) */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            
            {/* HISTOGRAM (YÜKSEKLİK VE RENK GÜNCELLENDİ) */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Gelir / Gider Analizi</Typography>
                <Divider sx={{ mb: 2 }} />
                {/* Yükseklik 400'den 450'ye çıkarıldı */}
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 10, fill: "#666" }} 
                      interval={0} 
                      angle={-30} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                        formatter={(v) => `${formatCurrency(v)} ${selectedCurrency}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                    
                    {/* YENİ MODERN RENKLER & STİL */}
                    <Bar 
                        name="Gelir" 
                        dataKey="income" 
                        fill="#10B981"  // Emerald Green
                        radius={[8, 8, 0, 0]} // Yuvarlatılmış köşe (daha modern)
                        barSize={32}          // Sabit kalınlık (daha şık)
                    />
                    <Bar 
                        name="Gider" 
                        dataKey="expense" 
                        fill="#F43F5E"  // Rose Red
                        radius={[8, 8, 0, 0]} 
                        barSize={32}
                    />
                    
                    <Brush 
                        dataKey="category" 
                        height={30} 
                        stroke="#10B981" 
                        fill="#f0fdf4"
                        startIndex={0}
                        endIndex={7}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Charts */}
            <Grid container spacing={3}>
              {[ { title: "Gelir", data: incomePie }, { title: "Gider", data: expensePie } ].map((chart, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                     <CardContent>
                      <Typography variant="h6" align="center" fontWeight="bold">{chart.title} Dağılımı</Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={chart.data} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                            {chart.data.map((entry, index) => <Cell key={index} fill={getCategoryColor(entry.name)} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `${formatCurrency(v)} ${selectedCurrency}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
                          {chart.data.map((entry, index) => (
                              <Box key={index} display="flex" alignItems="center" fontSize={11}>
                                  <Box sx={{ width: 10, height: 10, bgcolor: getCategoryColor(entry.name), mr: 0.5, borderRadius: '50%' }} />
                                  {entry.name}
                              </Box>
                          ))}
                      </Box>
                     </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>

        {/* Sağ Panel */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Kurlar */}
            <Card sx={{ borderRadius: 4, background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CurrencyExchange /> <Typography variant="h6">Piyasa Kurları</Typography>
                </Box>
                <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />
                {['USD', 'EUR', 'GBP'].map((code) => (
                    <Box key={code} display="flex" justifyContent="space-between" mb={1.5} sx={{ bgcolor: "rgba(255,255,255,0.05)", p: 1.5, borderRadius: 2 }}>
                        <Typography fontWeight="bold">{code} / TRY</Typography>
                        <Typography fontWeight="bold" color="#34D399">
                             {exchangeRates[code] ? exchangeRates[code].toFixed(4) : "..."} ₺
                        </Typography>
                    </Box>
                ))}
              </CardContent>
            </Card>

            {/* Çevirici */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <SwapHoriz color="primary" /> <Typography variant="h6" fontWeight="bold">Hızlı Çevirici</Typography>
                </Box>
                <Stack spacing={2}>
                    <TextField fullWidth label="Miktar" type="number" size="small" value={widgetAmount} onChange={(e) => setWidgetAmount(e.target.value)} />
                    <Box display="flex" gap={1}>
                        <TextField select fullWidth label="Giriş" size="small" value={widgetFrom} onChange={(e) => setWidgetFrom(e.target.value)}>
                             {["TRY","USD","EUR","GBP"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                        <TextField select fullWidth label="Çıkış" size="small" value={widgetTo} onChange={(e) => setWidgetTo(e.target.value)}>
                             {["TRY","USD","EUR","GBP"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                    </Box>
                    <Button variant="contained" fullWidth onClick={calculateWidget} sx={{ borderRadius: 2, fontWeight: "bold" }}>Hesapla</Button>
                    
                    {widgetResult !== null && (
                        <Box sx={{ bgcolor: "#E3F2FD", p: 2, borderRadius: 2, textAlign: "center", mt: 1 }}>
                             <Typography variant="h5" color="primary.main" fontWeight="bold">
                                {formatCurrency(widgetResult)} <span style={{fontSize: "0.7em"}}>{widgetTo}</span>
                             </Typography>
                        </Box>
                    )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;