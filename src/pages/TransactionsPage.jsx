import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, Paper, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Pagination
} from "@mui/material";
import api from "../services/api";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [isIncome, setIsIncome] = useState(true);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,16));
  const [categoryId, setCategoryId] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);

  const [filterPeriod, setFilterPeriod] = useState("1m");
  const [filterCategory, setFilterCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 🔢 Sayı formatlayıcı (binlik + virgüllü)
  const formatNumber = (value) => {
    if (!value) return "";
    const num = parseFloat(value.toString().replace(/\./g, "").replace(",", "."));
    if (isNaN(num)) return "";
    return num.toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Formatlı sayıdan normal float değeri çıkar
  const parseFormattedNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/\./g, "").replace(",", "."));
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (res.data.length) setCategoryId(res.data[0].id);
    } catch (err) {
      console.error("Kategori alınamadı:", err);
    }
  };

  const fetchTransactions = async (pageNumber = 1) => {
    try {
      const res = await api.get("/transactions", {
        params: {
          page: pageNumber,
          pageSize,
          period: filterPeriod,
          categoryId: filterCategory ? parseInt(filterCategory) : undefined
        }
      });
      setTransactions(res.data.transactions || []);
      setTotalPages(Math.ceil((res.data.totalRecords || 0) / pageSize));
    } catch (err) {
      console.error("Transactions alınamadı:", err);
    }
  };

  const handleAdd = async () => {
    try {
      await api.post("/transactions", {
        amount: parseFormattedNumber(amount),
        isIncome,
        note,
        date: new Date(date),
        categoryId
      });
      setAmount(""); setNote("");
      fetchTransactions(page);
    } catch (err) {
      console.error("Transaction eklenirken hata:", err);
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setDeleteTransactionId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTransactionId) return;
    try {
      await api.delete(`/transactions/${deleteTransactionId}`);
      fetchTransactions(page);
    } catch (err) {
      console.error("Silme hatası:", err);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTransactionId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteTransactionId(null);
  };

  const handleOpenDialog = (tr) => {
    setCurrentTransaction({
      ...tr,
      amount: formatNumber(tr.amount)
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTransaction(null);
  };

  const handleUpdateDialog = async () => {
    if (!currentTransaction) return;
    try {
      await api.put(`/transactions/${currentTransaction.id}`, {
        amount: parseFormattedNumber(currentTransaction.amount),
        isIncome: currentTransaction.isIncome,
        note: currentTransaction.note,
        date: new Date(currentTransaction.date),
        categoryId: currentTransaction.categoryId
      });
      handleCloseDialog();
      fetchTransactions(page);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchTransactions(value);
  };

  const handleFilterButton = () => {
    setPage(1);
    fetchTransactions(1);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>İşlemler</Typography>

      {/* Filtreler */}
      <Paper sx={{ p:2, mb:3, display:"flex", gap:2, flexWrap:"wrap", alignItems:"center" }}>
        <TextField
          select
          label="Periyot"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          sx={{ minWidth:120 }}
        >
          <MenuItem value="1m">Son 1 Ay</MenuItem>
          <MenuItem value="3m">Son 3 Ay</MenuItem>
          <MenuItem value="6m">Son 6 Ay</MenuItem>
          <MenuItem value="9m">Son 9 Ay</MenuItem>
          <MenuItem value="12m">Son 1 Yıl</MenuItem>
        </TextField>

        <TextField
          select
          label="Kategori"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          sx={{ minWidth:150 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={handleFilterButton}>Filtrele</Button>
      </Paper>

      {/* Yeni İşlem Ekle */}
      <Paper sx={{ p:2, mb:3 }}>
        <Box sx={{ display:"flex", flexDirection:"column", gap:2 }}>
          <TextField
            label="Tutar"
            value={amount}
            onChange={(event) => {
              let val = event.target.value.replace(/\./g, "").replace(",", ".");
              if (!/^\d*\.?\d*$/.test(val)) return;
              const [intPart, decPart] = val.split(".");
              const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              if (decPart === undefined) {
                setAmount(formattedInt);
              } else {
                setAmount(`${formattedInt},${decPart}`);
              }
            }}
            onBlur={() => {
              const numeric = parseFloat(amount.replace(/\./g, "").replace(",", "."));
              if (!isNaN(numeric)) {
                setAmount(
                  numeric.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                );
              }
            }}
          />
          <TextField
            select
            label="Kategori"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Not"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <TextField
            label="Tarih"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            InputLabelProps={{ shrink:true }}
          />
          <TextField
            select
            label="Tür"
            value={isIncome}
            onChange={(event) => setIsIncome(event.target.value === "true")}
          >
            <MenuItem value={true}>Gelir</MenuItem>
            <MenuItem value={false}>Gider</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleAdd}>İşlem Ekle</Button>
        </Box>
      </Paper>

      {/* Liste */}
      <Paper>
        <List>
          {transactions.map(tr => (
            <ListItem key={tr.id} secondaryAction={
              <>
                <Button color="primary" onClick={()=>handleOpenDialog(tr)}>Güncelle</Button>
                <Button color="error" onClick={()=>handleOpenDeleteDialog(tr.id)}>Sil</Button>
              </>
            }>
              <ListItemText
                primary={`${tr.categoryName} - ${formatNumber(tr.amount)} ${tr.isIncome ? "Gelir" : "Gider"}`}
                secondary={`${new Date(tr.date).toLocaleString()} - ${tr.note || ""}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Pagination */}
      <Box sx={{ display:"flex", justifyContent:"center", mt:2 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
      </Box>

      {/* Güncelleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>İşlem Güncelle</DialogTitle>
        <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2, mt:1 }}>
          <TextField
            label="Tutar"
            value={currentTransaction?.amount || ""}
            onChange={(event) => {
              let val = event.target.value.replace(/\./g, "").replace(",", ".");
              if (!/^\d*\.?\d*$/.test(val)) return;
              const [intPart, decPart] = val.split(".");
              const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              if (decPart === undefined) {
                setCurrentTransaction(prev => ({ ...prev, amount: formattedInt }));
              } else {
                setCurrentTransaction(prev => ({ ...prev, amount: `${formattedInt},${decPart}` }));
              }
            }}
            onBlur={() => {
              const numeric = parseFloat(currentTransaction.amount.replace(/\./g, "").replace(",", "."));
              if (!isNaN(numeric)) {
                setCurrentTransaction(prev => ({
                  ...prev,
                  amount: numeric.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                }));
              }
            }}
          />
          <TextField
            select
            label="Kategori"
            value={currentTransaction?.categoryId || ""}
            onChange={(event) => setCurrentTransaction(prev => ({ ...prev, categoryId: event.target.value }))}
          >
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Not"
            value={currentTransaction?.note || ""}
            onChange={(event) => setCurrentTransaction(prev => ({ ...prev, note: event.target.value }))}
          />
          <TextField
            label="Tarih"
            type="datetime-local"
            value={currentTransaction?.date?.slice(0,16) || ""}
            onChange={(event) => setCurrentTransaction(prev => ({ ...prev, date: event.target.value }))}
            InputLabelProps={{ shrink:true }}
          />
          <TextField
            select
            label="Tür"
            value={currentTransaction?.isIncome || true}
            onChange={(event) => setCurrentTransaction(prev => ({ ...prev, isIncome: event.target.value === "true" }))}
          >
            <MenuItem value={true}>Gelir</MenuItem>
            <MenuItem value={false}>Gider</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleUpdateDialog} variant="contained">Güncelle</Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} fullWidth maxWidth="xs">
        <DialogTitle>İşlem Silinecek</DialogTitle>
        <DialogContent>
          <Typography>Seçtiğiniz işlem geri alınamaz şekilde silinecektir. Emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
