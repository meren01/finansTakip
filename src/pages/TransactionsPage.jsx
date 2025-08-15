import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, MenuItem, Paper, List, ListItem, ListItemText
} from "@mui/material";
import api from "../services/api";

export default function TransactionsPage() {
  // Durum değişkenleri
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [isIncome, setIsIncome] = useState(true);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,16));
  const [categoryId, setCategoryId] = useState("");

  // Kategorileri çek
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (res.data.length) setCategoryId(res.data[0].id);
    } catch (err) {
      console.error("Kategori alınamadı:", err);
    }
  };

  // İşlemleri çek
  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Transactions alınamadı:", err);
    }
  };

  // Yeni işlem ekle
  const handleAdd = async () => {
    try {
      await api.post("/transactions", {
        amount: parseFloat(amount),
        isIncome,
        note,
        date: new Date(date), // Backend uyumlu format
        categoryId
      });
      setAmount("");
      setNote("");
      fetchTransactions(); // Listeyi yenile
    } catch (err) {
      console.error("Transaction eklenirken hata:", err);
    }
  };

  // İşlem sil
  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  // İşlem güncelle
  const handleUpdate = async (id) => {
    try {
      const updatedAmount = prompt("Yeni tutarı girin:");
      if (!updatedAmount) return;

      await api.put(`/transactions/${id}`, {
        amount: parseFloat(updatedAmount),
        isIncome,
        note,
        date: new Date(date),
        categoryId
      });
      fetchTransactions();
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
          <TextField label="Tutar" value={amount} onChange={e=>setAmount(e.target.value)} type="number"/>
          <TextField select label="Kategori" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
          </TextField>
          <TextField label="Not" value={note} onChange={e=>setNote(e.target.value)}/>
          <TextField
            label="Tarih"
            type="datetime-local"
            value={date}
            onChange={e=>setDate(e.target.value)}
            InputLabelProps={{ shrink:true }}
          />
          <TextField select label="Tür" value={isIncome} onChange={e=>setIsIncome(e.target.value==="true")}>
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
                <Button color="primary" onClick={()=>handleUpdate(tr.id)}>Güncelle</Button>
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
    </Box>
  );
}
