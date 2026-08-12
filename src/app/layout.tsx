import type { Metadata } from "next";
import {
  Playfair_Display,
  Montserrat,
} from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elena & Marcus — Our Wedding",
  description:
    "Join Elena & Marcus as they celebrate their wedding on November 10, 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>

      <body className="bg-background text-on-surface antialiased min-h-screen">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}