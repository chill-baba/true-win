import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "1win | Online Casino & Sports Betting",
  description: "Official 1win sports betting and online casino platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased colorScheme-dark`}
      style={{
        // @ts-expect-error CSS variables for 1win modal layout
        "--z-index-betting-modal": 141,
        "--z-index-betting-tooltip": 150,
        "--z-index-betting-trigger": 101,
        "--rounding-component-popover": "16px",
      }}
    >
      <head>
        <link rel="stylesheet" href="/css/variables.css" />
        <link rel="stylesheet" href="/css/login.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
