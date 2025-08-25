import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, Paper, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import api from "../services/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [isIncome, setIsIncome] = useState(true);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,16));
  const [categoryId, setCategoryId] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (res.data.length) setCategoryId(res.data[0].id);
    } catch (err) {
      console.error("Kategori alınamadı:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Transactions alınamadı:", err);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await api.post("/transactions", {
        amount: parseFloat(amount),
        isIncome,
        note,
        date: new Date(date),
        categoryId
      });
      setTransactions(prev => [...prev, res.data]);
      setAmount(""); setNote("");
    } catch (err) {
      console.error("Transaction eklenirken hata:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(tr => tr.id !== id));
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleOpenDialog = (tr) => {
    setCurrentTransaction({ ...tr });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTransaction(null);
  };

  const handleUpdateDialog = async () => {
    if (!currentTransaction) return;
    try {
      const res = await api.put(`/transactions/${currentTransaction.id}`, {
        amount: parseFloat(currentTransaction.amount),
        isIncome: currentTransaction.isIncome,
        note: currentTransaction.note,
        date: new Date(currentTransaction.date),
        categoryId: currentTransaction.categoryId
      });
      setTransactions(prev => prev.map(tr => tr.id === currentTransaction.id ? res.data : tr));
      handleCloseDialog();
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>İşlemler</Typography>

      <Paper sx={{ p:2, mb:3 }}>
        <Box sx={{ display:"flex", flexDirection:"column", gap:2 }}>
          <TextField
            label="Tutar"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
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

      <Paper>
        <List>
          {transactions.map(tr => (
            <ListItem key={tr.id} secondaryAction={
              <>
                <Button color="primary" onClick={()=>handleOpenDialog(tr)}>Güncelle</Button>
                <Button color="error" onClick={()=>handleDelete(tr.id)}>Sil</Button>
              </>
            }>
              <ListItemText
                primary={`${tr.categoryName} - ${tr.amount} ${tr.isIncome ? "Gelir" : "Gider"}`}
                secondary={`${new Date(tr.date).toLocaleString()} - ${tr.note || ""}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>İşlem Güncelle</DialogTitle>
        <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2, mt:1 }}>
          <TextField
            label="Tutar"
            type="number"
            value={currentTransaction?.amount || ""}
            onChange={(event) => setCurrentTransaction(prev => ({ ...prev, amount: event.target.value }))}
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
    </Box>
  );
}

