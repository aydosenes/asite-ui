"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Auth({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("main-token");

    if (!token) {
      router.replace("/");
    }
  }, []);

  return <>{children}</>;
}
