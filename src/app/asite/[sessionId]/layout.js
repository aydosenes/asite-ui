"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { Box, IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { usePathname, useRouter } from "next/navigation";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/");
  const sessionId = segments[2];
  const userId = segments[4];
  const [open, setOpen] = React.useState(false);

  const handleMapping = () => {
    const newUrl = `/asite/${sessionId}/mapping/${userId}`;
    router.push(newUrl);
  };

  const handleEsignature = () => {
    const newUrl = `/asite/${sessionId}/flow/${userId}`;
    router.push(newUrl);
  };

  const handleCraneFormTemplate = () => {
    const newUrl = `/asite/${sessionId}/crane/${userId}`;
    router.push(newUrl);
  };

  const handleProjectCloner = () => {
    const newUrl = `/asite/${sessionId}/cloner/${userId}`;
    router.push(newUrl);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const [token, setToken] = useState(null);
  const [loginDialog, setLoginDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmLogoutDialog, setConfirmLogoutDialog] = useState(false);

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/api/Auth/create-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setToken(data.data.access_token);
        localStorage.setItem("crane-user", email);
        localStorage.setItem("crane-token", data.data.access_token);
      } else {
        const data = await response.json();
        setError(data.message || "Login failed");
      }
      setLoading(false);
      setLoginDialog(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.setItem("crane-user", "");
    localStorage.setItem("crane-token", "");
    setConfirmLogoutDialog(false);
  };

  const handleAuthClick = () => {
    if (token) {
      setConfirmLogoutDialog(true);
    } else {
      setLoginDialog(true);
    }
  };

  useEffect(() => {
    const craneToken = localStorage.getItem("crane-token") || "";
    const craneUser = localStorage.getItem("crane-user") || "";
    if (craneToken) {
      setToken(craneToken);
      setEmail(craneUser);
    }
  }, []);

  const DrawerList = (
    <Box
      sx={{
        width: 250,
        height: "100%", // Drawer yüksekliğini kapla
        display: "flex",
        flexDirection: "column", // içerikleri dikey hizala
        justifyContent: "space-between", // üst menüler yukarıda, login aşağıda
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <Box>
        <List>
          {["Asite Form Mapping"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={handleMapping}>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["E-Signature"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={handleEsignature}>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Crane Form Template"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={handleCraneFormTemplate}>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Project Cloner"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={handleProjectCloner}>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleAuthClick}>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary={token ? email : "Crane Login"} />
              {!token && <LoginIcon />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          width: "40px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1300,
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: "1px solid #ccc",
        }}
      >
        <IconButton onClick={toggleDrawer(!open)} size="large">
          {open ? <ArrowBackIosNewIcon /> : <ArrowForwardIosIcon />}
        </IconButton>
      </Box>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>

      <Dialog open={loginDialog} onClose={() => setLoginDialog(false)}>
        <DialogTitle>Giriş Yap</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Kullanıcı Adı"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Şifre"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialog(false)} disabled={loading}>
            Vazgeç
          </Button>
          <Button variant="contained" onClick={handleLogin} disabled={loading}>
            Giriş Yap
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmLogoutDialog}
        onClose={() => setConfirmLogoutDialog(false)}
      >
        <DialogTitle>Çıkış Yap</DialogTitle>
        <DialogContent>
          <DialogContentText>Oturum sonlandırılsın mı?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutDialog(false)}>Hayır</Button>
          <Button variant="contained" onClick={handleLogout}>
            Evet
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 6,
          ml: "40px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
