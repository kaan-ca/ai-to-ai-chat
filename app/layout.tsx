import type { Metadata } from "next";
import { Funnel_Display, Inter_Tight } from "next/font/google";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ai-to-ai-chat",
  description: "Make two LLMs talk to each other",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${funnelDisplay.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
