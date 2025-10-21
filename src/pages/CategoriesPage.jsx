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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { Delete, Edit, Save, Close } from "@mui/icons-material";
import api from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null); // Silinecek kategori id’si
  const [openDialog, setOpenDialog] = useState(false); // Pop-up kontrolü

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
      const res = await api.post("/categories", { name });
      setCategories(prev => [...prev, res.data]);
      setName("");
    } catch (err) {
      console.error("Kategori eklenirken hata:", err);
    }
  };

  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setOpenDialog(true); // Pop-up aç
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteId}`);
      setCategories(prev => prev.filter(cat => cat.id !== deleteId));
    } catch (err) {
      console.error("Kategori silinirken hata:", err);
    } finally {
      setOpenDialog(false); // Pop-up kapat
      setDeleteId(null);
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
      const res = await api.put(`/categories/${id}`, { name: editName });
      setCategories(prev => prev.map(cat => cat.id === id ? res.data : cat));
      setEditId(null);
      setEditName("");
    } catch (err) {
      console.error("Kategori güncellenirken hata:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={3}>Kategoriler</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField label="Kategori Adı" value={name} onChange={(e) => setName(e.target.value)} />
        <Button variant="contained" onClick={handleAdd}>Ekle</Button>
      </Box>

      <Paper>
        <List>
          {categories.map(cat => (
            <ListItem
              key={cat.id}
              secondaryAction={
                editId === cat.id ? (
                  <>
                    <IconButton edge="end" color="success" onClick={() => handleEditSave(cat.id)}><Save /></IconButton>
                    <IconButton edge="end" color="error" onClick={handleEditCancel}><Close /></IconButton>
                  </>
                ) : (
                  <>
                    <IconButton edge="end" color="primary" onClick={() => handleEditStart(cat)}><Edit /></IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleDeleteConfirm(cat.id)}><Delete /></IconButton>
                  </>
                )
              }
            >
              {editId === cat.id ? (
                <TextField value={editName} onChange={(e) => setEditName(e.target.value)} />
              ) : (
                <ListItemText primary={cat.name} />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Silme onay pop-up'ı */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Kategori Silme Onayı</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Seçtiğiniz kategoriye ait <strong>tüm veriler geri döndürülemez şekilde silinecektir.</strong><br />
            Bu işlemi yapmak istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Vazgeç
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
