import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Header = ({ isAuthenticated, isAdmin = false, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Gelir-Gider Takip
          </Link>
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
              <Button color="inherit" component={Link} to="/categories">Kategoriler</Button>
              <Button color="inherit" component={Link} to="/transactions">İşlemler</Button>
              {isAdmin && <Button color="inherit" component={Link} to="/admin">Admin Panel</Button>}
              <Button color="inherit" onClick={handleLogoutClick}>Çıkış Yap</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Giriş Yap</Button>
              <Button color="inherit" component={Link} to="/register">Kayıt Ol</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;  