import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, MenuItem, Paper, List, ListItem, ListItemText,
  IconButton, Switch
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Delete, Edit, Save, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminPage() {
  const navigate = useNavigate();

  // --- Kullanıcılar ---
  const [users, setUsers] = useState([]);

 
;

  // --- Kullanıcılar ---
  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Yetkiniz yok! Admin girişi yapmanız gerekiyor.");
        navigate("/login");
      } else {
        console.error("Kullanıcılar alınamadı:", err);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      await fetchUsers();
    } catch (err) { console.error("Kullanıcı silinemedi:", err); }
  };

  const userColumns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "userName", headerName: "Kullanıcı Adı", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "role",
      headerName: "Admin",
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.row.role === "Admin"}
          onChange={async (e) => {
            try {
              // API isAdmin boolean bekliyorsa:
              await api.put(`/admin/users/${params.row.id}/admin-status`, {
                isAdmin: e.target.checked
              });
              fetchUsers();
            } catch (err) {
              console.error("Rol güncellenemedi:", err);
              console.log("Gönderilen JSON:", { isAdmin: e.target.checked });

            }
          }}
          color="primary"
          
        />
        
      ),
      
    },
    
    {
      field: "actions",
      headerName: "İşlemler",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleDeleteUser(params.row.id)}
        >
          Sil
        </Button>
      ),
    },
  ];


  useEffect(()=>{
    fetchUsers();
   
  },);

  return (
    <Box p={3}>
     

      {/* Kullanıcılar */}
      <Typography variant="h5" mt={2} mb={1}>Kullanıcılar</Typography>
      <div style={{ height: 400, width: "100%", marginBottom: 30 }}>
        <DataGrid rows={users} columns={userColumns} pageSize={10} rowsPerPageOptions={[10]} disableSelectionOnClick/>
      </div>
    </Box>
  );
}
