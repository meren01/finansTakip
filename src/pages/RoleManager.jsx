import React, { useState, useEffect } from "react";
import { Select, MenuItem, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import api from "../services/api";

const RoleManager = () => {
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        setUsers(response.data);

        const roles = {};
        response.data.forEach((user) => {
          roles[user.id] = user.role;
        });
        setSelectedRoles(roles);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleSave = async (userId) => {
    try {
      await api.post("/admin/assign-role", {
        userId,
        role: selectedRoles[userId],
      });
      alert("Rol başarıyla güncellendi!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <h2>Rol Yönetimi</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Kullanıcı Adı</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Güncelle</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={selectedRoles[user.id] || ""}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="contained" onClick={() => handleSave(user.id)}>
                  Kaydet
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default RoleManager;
