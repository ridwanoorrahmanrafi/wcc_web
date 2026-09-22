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
  title: "We Can Change (WCC) | Membership & Finance Portal",
  description: "Official enterprise membership directory, activity cost accounting, and treasury management system for We Can Change (WCC), Jhalokathi, Bangladesh.",
  icons: {
    icon: "/wcc_logo.png"
  }
};

import AppShell from "@/Components/AppShell";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#F8FAFC] text-slate-900" suppressHydrationWarning>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
