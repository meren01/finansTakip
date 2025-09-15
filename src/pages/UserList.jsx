import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import api from "../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Kullanıcı listesi alınamadı:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <h2>Kullanıcı Listesi</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Kullanıcı Adı</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default UserList;
