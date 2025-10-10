import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Penguen Asite Integration",
  description: "by enesaydos",  
};

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <head><link rel="icon" href="https://www.penguen.ist/wp-content/uploads/2018/12/favicon-1.png" /></head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
