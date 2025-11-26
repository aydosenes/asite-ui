"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Container, Typography } from "@mui/material";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
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
          localStorage.setItem("main-user", email);
          localStorage.setItem("main-token", data.access_token);
          const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem(
            "main-token-expiration",
            expirationTime.toString()
          );
          router.push(`/home`);
        } else {
          const data = await response.json();
          setError(data.message || "Login failed");
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message || "Login failed");
    }
  };
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/penguen.jpeg"
          alt="Next.js logo"
          width={200}
          height={100}
          priority
        />

        <div className={styles.ctas}>
          <Container maxWidth="sm">
            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <Typography color="error">{error}</Typography>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                Login
              </Button>
            </form>
          </Container>
        </div>
      </main>
    </div>
  );
}
