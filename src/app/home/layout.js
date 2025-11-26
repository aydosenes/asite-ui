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
import { CircularProgress } from "@mui/material";
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
    const newUrl = `/home/mapping`;
    router.push(newUrl);
  };

  const handleEsignature = () => {
    const newUrl = `/home/flow`;
    router.push(newUrl);
  };

  const handleCraneFormTemplate = () => {
    const newUrl = `/home/crane`;
    router.push(newUrl);
  };

  const handleProjectCloner = () => {
    const newUrl = `/home/cloner`;
    router.push(newUrl);
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const [token, setToken] = useState(null);
  const [type, setType] = useState("");
  const [asiteToken, setAsiteToken] = useState(null);
  const [loginDialog, setLoginDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [emailAsite, setEmailAsite] = useState("");
  const [emailCrane, setEmailCrane] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmLogoutDialog, setConfirmLogoutDialog] = useState(false);

  const handleLogin = async () => {
    try {
      if (email && password) {
        setLoading(true);        
        if (type === "crane") {   
          setEmailCrane(email);       
          const response = await fetch(
            `${process.env.BASE_URL}/api/Auth/crane-token`,
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
            const expirationTime = Date.now() + data.data.expires_in * 1000;
            localStorage.setItem(
              "crane-token-expiration",
              expirationTime.toString()
            );
          } else {
            const data = await response.json();
            setError(data.message || "Login failed");
          }
        } else {
          setEmailAsite(email);
          const response = await fetch(
            `${process.env.BASE_URL}/api/Asite/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.message) {
              setError(data.message);
              setLoading(false);
            } else {
              setAsiteToken(data.sessionId);
              localStorage.setItem("asite-userId", data.userId);
              localStorage.setItem("asite-sessionId", data.sessionId);
              const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
              localStorage.setItem(
                "asite-sessionId-expiration",
                expirationTime.toString()
              );
            }
          } else {
            const data = await response.json();
            setError(data.message || "Login failed");
          }
        }
        setLoading(false);
        setLoginDialog(false);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message || "Login failed");
    } finally{
      setEmail("");
      setPassword("");
    }
  };

  const handleLogout = () => {
    if (type === "crane") {
      setToken(null);
      localStorage.setItem("crane-user", "");
      localStorage.setItem("crane-token", "");
      localStorage.setItem("crane-refresh-token", "");
      localStorage.setItem("crane-token-expiration", "");
    } else {
      setAsiteToken(null);
      localStorage.setItem("asite-userId", "");
      localStorage.setItem("asite-sessionId", "");
      localStorage.setItem("asite-sessionId-expiration", "");
    }
    setConfirmLogoutDialog(false);
  };

  const handleAuthClick = (type) => {
    console.log(type);
    setType(type);
    if (type === "crane" && token) {
      setConfirmLogoutDialog(true);
    } else if (type === "asite" && asiteToken) {
      setConfirmLogoutDialog(true);
    } else {
      setLoginDialog(true);
    }
  };

  useEffect(() => {
    function checkExpiration() {
      if (type === "crane") {
        const expirationTimeStr =
          localStorage.getItem("crane-token-expiration") || "";
        if (expirationTimeStr) {
          const expirationTime = Number(expirationTimeStr);
          const remainingTime = expirationTime - Date.now();
          if (remainingTime <= 0) {
            localStorage.setItem("crane-user", "");
            localStorage.setItem("crane-token", "");
            localStorage.setItem("crane-token-expiration", "");
            setToken(null);
            setEmail("");
          } else {
            const craneToken = localStorage.getItem("crane-token") || "";
            const craneUser = localStorage.getItem("crane-user") || "";
            if (craneToken) {
              setToken(craneToken);
              setEmail(craneUser);
            }
            setTimeout(() => {
              localStorage.setItem("crane-user", "");
              localStorage.setItem("crane-token", "");
              localStorage.setItem("crane-token-expiration", "");
              setToken(null);
              setEmail("");
            }, remainingTime);
          }
        }
      } else {
        const expirationTimeStr =
          localStorage.getItem("asite-sessionId-expiration") || "";
        if (expirationTimeStr) {
          const expirationTime = Number(expirationTimeStr);
          const remainingTime = expirationTime - Date.now();
          if (remainingTime <= 0) {
            localStorage.setItem("asite-userId", "");
            localStorage.setItem("asite-sessionId", "");
            localStorage.setItem("asite-sessionId-expiration", "");
            setAsiteToken(null);
            setEmail("");
          } else {
            const asiteToken = localStorage.getItem("asite-sessionId") || "";
            const asiteUser = localStorage.getItem("asite-userId") || "";
            if (asiteToken) {
              setAsiteToken(asiteToken);
              setEmail(asiteUser);
            }
            setTimeout(() => {
              localStorage.setItem("asite-userId", "");
              localStorage.setItem("asite-sessionId", "");
              localStorage.setItem("asite-sessionId-expiration", "");
              setAsiteToken(null);
              setEmail("");
            }, remainingTime);
          }
        }
      }
    }
    checkExpiration();

    var intervalId = setInterval(checkExpiration, 5000);

    return function cleanup() {
      clearInterval(intervalId);
    };
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
              <ListItemButton onClick={handleMapping} disabled={!asiteToken}>
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
              <ListItemButton onClick={handleEsignature} disabled={!asiteToken}>
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
              <ListItemButton
                onClick={handleCraneFormTemplate}
                disabled={!token}
              >
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
          {["Crane"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={handleProjectCloner} disabled={!token}>
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
            <ListItemButton onClick={() => handleAuthClick("asite")}>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary={asiteToken ? emailAsite : "Asite Login"} />
              {!asiteToken && <LoginIcon />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleAuthClick("crane")}>
              <ListItemIcon></ListItemIcon>
              <ListItemText primary={token ? emailCrane : "Crane Login"} />
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
            {loading ? (
              <CircularProgress size="20px" color="inherit" />
            ) : (
              "Vazgeç"
            )}
          </Button>
          <Button variant="contained" onClick={handleLogin} disabled={loading}>
            {loading ? (
              <CircularProgress size="20px" color="inherit" />
            ) : (
              "Giriş Yap"
            )}
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
