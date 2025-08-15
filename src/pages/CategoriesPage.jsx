import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton
} from "@mui/material";
import { Delete, Edit, Save, Close } from "@mui/icons-material";
import api from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Kategoriler alınırken hata:", err);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await api.post("/categories", { name });
      setName("");
      fetchCategories();
    } catch (err) {
      console.error("Kategori eklenirken hata:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Kategori silinirken hata:", err);
    }
  };

  const handleEditStart = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditName("");
  };

  const handleEditSave = async (id) => {
    try {
      await api.put(`/categories/${id}`, { name: editName });
      setEditId(null);
      setEditName("");
      fetchCategories();
    } catch (err) {
      console.error("Kategori güncellenirken hata:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Kategoriler
      </Typography>

      {/* Ekleme Alanı */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Kategori Adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Ekle
        </Button>
      </Box>

      {/* Liste */}
      <Paper>
        <List>
          {categories.map((cat) => (
            <ListItem
              key={cat.id}
              secondaryAction={
                editId === cat.id ? (
                  <>
                    <IconButton
                      edge="end"
                      color="success"
                      onClick={() => handleEditSave(cat.id)}
                    >
                      <Save />
                    </IconButton>
                    <IconButton edge="end" color="error" onClick={handleEditCancel}>
                      <Close />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleEditStart(cat)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            >
              {editId === cat.id ? (
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <ListItemText primary={cat.name} />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
