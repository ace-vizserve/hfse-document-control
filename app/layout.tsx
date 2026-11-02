import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HFSE Document Control",
  description: "HFSE controlled document register, approval records and review tracking.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
