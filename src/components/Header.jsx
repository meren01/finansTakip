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
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #153e75 0%, #3a5ca8 50%, #6a8dd9 100%)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Sol taraf (Logo) */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "white",
            fontWeight: 600,
            letterSpacing: 0.8,
            textShadow: "0 0 6px rgba(255,255,255,0.3)",
            "&:hover": { color: "#a7c7ff", transition: "0.3s" },
          }}
        >
          Gelir-Gider Takip
        </Typography>

        {/* Sağ taraf (Menü) */}
        {isAuthenticated && (
          <Box sx={{ display: "flex", gap: 2 }}>
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/categories", label: "Kategoriler" },
              { to: "/transactions", label: "İşlemler" },
              ...(isAdmin ? [{ to: "/admin", label: "Admin Panel" }] : []),
            ].map((btn) => (
              <Button
                key={btn.to}
                component={Link}
                to={btn.to}
                sx={{
                  color: "#fff",
                  background: "linear-gradient(90deg, #3a4ca8, #2e3d8c)",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "20px",
                  px: 2.5,
                  boxShadow: "0 0 6px rgba(100, 130, 180, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #4a5cb8, #3848a0)",
                    transform: "scale(1.03)",
                    transition: "all 0.25s ease",
                    boxShadow: "0 0 10px rgba(120, 150, 200, 0.4)",
                  },
                }}
              >
                {btn.label}
              </Button>
            ))}

            <Button
              onClick={handleLogoutClick}
              sx={{
                color: "#fff",
                background: "linear-gradient(90deg, #3a4ca8, #2e3d8c)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "20px",
                px: 2.5,
                boxShadow: "0 0 6px rgba(100, 130, 180, 0.3)",
                "&:hover": {
                  background: "linear-gradient(90deg, #4a5cb8, #3848a0)",
                  transform: "scale(1.03)",
                  transition: "all 0.25s ease",
                  boxShadow: "0 0 10px rgba(120, 150, 200, 0.4)",
                },
              }}
            >
              Çıkış Yap
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

